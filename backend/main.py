import sqlite3, time, secrets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware

OTP = "123456"
db = sqlite3.connect("signal.db", check_same_thread=False)
db.row_factory = sqlite3.Row
db.executescript("""
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, phone TEXT UNIQUE, display_name TEXT, color TEXT, last_seen REAL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS conversations(id INTEGER PRIMARY KEY, type TEXT CHECK(type IN('direct','group')), name TEXT, created_at REAL);
CREATE TABLE IF NOT EXISTS members(conv_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE, user_id INTEGER REFERENCES users(id), role TEXT DEFAULT 'member', PRIMARY KEY(conv_id,user_id));
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, conv_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE, sender_id INTEGER REFERENCES users(id), body TEXT, status TEXT DEFAULT 'sent', created_at REAL);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conv_id, created_at);
""")

def seed():
    if db.execute("SELECT 1 FROM users").fetchone(): return
    cols = ["#3a76f0", "#e0457b", "#2ca58d", "#f2a900", "#8a5cf6"]
    for i, n in enumerate(["Alice", "Bob", "Carol", "Dave", "Eve"]):
        db.execute("INSERT INTO users(phone,display_name,color,last_seen) VALUES(?,?,?,?)", (f"+91000000000{i}", n, cols[i], time.time()))
    db.execute("INSERT INTO conversations(type,created_at) VALUES('direct',?)", (time.time(),))
    db.execute("INSERT INTO conversations(type,name,created_at) VALUES('group','Weekend Plans',?)", (time.time(),))
    db.executemany("INSERT INTO members VALUES(?,?,?)", [(1,1,'member'),(1,2,'member'),(2,1,'admin'),(2,2,'member'),(2,3,'member')])
    db.executemany("INSERT INTO messages(conv_id,sender_id,body,status,created_at) VALUES(?,?,?,?,?)",
        [(1,2,"Hey! Welcome to Signal clone 👋","sent",time.time()-60),(2,3,"Who's in for Saturday?","sent",time.time()-30)])
    db.commit()
seed()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
online: dict[int, set] = {}

def me(token):
    r = db.execute("SELECT user_id FROM sessions WHERE token=?", (token or "",)).fetchone()
    if not r: raise HTTPException(401)
    return r[0]

def members(cid): return [r[0] for r in db.execute("SELECT user_id FROM members WHERE conv_id=?", (cid,))]

async def push(uids, payload):
    for u in uids:
        for ws in list(online.get(u, ())):
            try: await ws.send_json(payload)
            except Exception: online[u].discard(ws)

@app.post("/auth/login")
def login(d: dict):
    if d.get("otp") != OTP: raise HTTPException(400, "Invalid code (use 123456)")
    u = db.execute("SELECT * FROM users WHERE phone=?", (d["phone"],)).fetchone()
    if not u:
        c = db.execute("INSERT INTO users(phone,display_name,color,last_seen) VALUES(?,?,?,?)",
                       (d["phone"], d.get("display_name") or d["phone"], "#3a76f0", time.time()))
        u = db.execute("SELECT * FROM users WHERE id=?", (c.lastrowid,)).fetchone()
    t = secrets.token_hex(16)
    db.execute("INSERT INTO sessions VALUES(?,?)", (t, u["id"])); db.commit()
    return {"token": t, "user": dict(u)}

@app.get("/users")
def users(q: str = "", authorization: str = Header(None)):
    uid = me(authorization)
    rows = db.execute("SELECT id,display_name,phone,color,last_seen FROM users WHERE id!=? AND (display_name LIKE ? OR phone LIKE ?)", (uid, f"%{q}%", f"%{q}%"))
    return [dict(r) | {"online": r["id"] in online} for r in rows]

@app.get("/conversations")
def conversations(authorization: str = Header(None)):
    uid = me(authorization); out = []
    for c in db.execute("SELECT c.* FROM conversations c JOIN members m ON m.conv_id=c.id WHERE m.user_id=?", (uid,)):
        name, color, other = c["name"], "#3a76f0", None
        if c["type"] == "direct":
            other = db.execute("SELECT u.* FROM users u JOIN members m ON m.user_id=u.id WHERE m.conv_id=? AND u.id!=?", (c["id"], uid)).fetchone()
            name, color = other["display_name"], other["color"]
        last = db.execute("SELECT body,created_at,sender_id,status FROM messages WHERE conv_id=? ORDER BY id DESC LIMIT 1", (c["id"],)).fetchone()
        unread = db.execute("SELECT COUNT(*) FROM messages WHERE conv_id=? AND sender_id!=? AND status!='read'", (c["id"], uid)).fetchone()[0]
        out.append({"id": c["id"], "type": c["type"], "name": name, "color": color, "unread": unread, "mine": bool(last and last["sender_id"] == uid), "status": last["status"] if last else None,
                    "last": last["body"] if last else "", "ts": last["created_at"] if last else c["created_at"],
                    "online": bool(other and other["id"] in online)})
    return sorted(out, key=lambda x: -x["ts"])

@app.post("/conversations")
def create(d: dict, authorization: str = Header(None)):
    uid = me(authorization); ids = set(d["member_ids"]) | {uid}
    if d["type"] == "direct":
        (o,) = ids - {uid}
        ex = db.execute("SELECT c.id FROM conversations c JOIN members a ON a.conv_id=c.id AND a.user_id=? JOIN members b ON b.conv_id=c.id AND b.user_id=? WHERE c.type='direct'", (uid, o)).fetchone()
        if ex: return {"id": ex[0]}
    c = db.execute("INSERT INTO conversations(type,name,created_at) VALUES(?,?,?)", (d["type"], d.get("name"), time.time()))
    for u in ids: db.execute("INSERT INTO members VALUES(?,?,?)", (c.lastrowid, u, "admin" if u == uid else "member"))
    db.commit(); return {"id": c.lastrowid}

@app.get("/conversations/{cid}/messages")
def msgs(cid: int, authorization: str = Header(None)):
    if me(authorization) not in members(cid): raise HTTPException(403)
    return [dict(r) for r in db.execute("SELECT m.*,u.display_name sender,u.color sender_color FROM messages m JOIN users u ON u.id=m.sender_id WHERE conv_id=? ORDER BY m.id", (cid,))]

@app.get("/conversations/{cid}/members")
def get_members(cid: int, authorization: str = Header(None)):
    me(authorization)
    return [dict(r) for r in db.execute("SELECT u.id,u.display_name,u.color,m.role FROM members m JOIN users u ON u.id=m.user_id WHERE conv_id=?", (cid,))]

def admin_only(cid, uid):
    r = db.execute("SELECT role FROM members WHERE conv_id=? AND user_id=?", (cid, uid)).fetchone()
    if not r or r[0] != "admin": raise HTTPException(403, "Admins only")

@app.post("/conversations/{cid}/members")
def add_member(cid: int, d: dict, authorization: str = Header(None)):
    admin_only(cid, me(authorization))
    db.execute("INSERT OR IGNORE INTO members VALUES(?,?,'member')", (cid, d["user_id"])); db.commit(); return {"ok": True}

@app.delete("/conversations/{cid}/members/{uid}")
def rm_member(cid: int, uid: int, authorization: str = Header(None)):
    caller = me(authorization)
    if caller != uid: admin_only(cid, caller)   # anyone may leave; only admins remove others
    db.execute("DELETE FROM members WHERE conv_id=? AND user_id=?", (cid, uid))
    if not db.execute("SELECT 1 FROM members WHERE conv_id=? AND role='admin'", (cid,)).fetchone():
        db.execute("UPDATE members SET role='admin' WHERE rowid=(SELECT rowid FROM members WHERE conv_id=? LIMIT 1)", (cid,))
    db.commit(); return {"ok": True}

@app.patch("/conversations/{cid}/members/{uid}")
def set_role(cid: int, uid: int, d: dict, authorization: str = Header(None)):
    admin_only(cid, me(authorization))
    db.execute("UPDATE members SET role=? WHERE conv_id=? AND user_id=?", (d["role"], cid, uid)); db.commit(); return {"ok": True}

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket, token: str):
    try: uid = me(token)
    except HTTPException: return await ws.close(4401)
    await ws.accept(); online.setdefault(uid, set()).add(ws)
    try:
        while True:
            d = await ws.receive_json(); cid = d.get("conv_id")
            if uid not in members(cid): continue
            others = [u for u in members(cid) if u != uid]
            if d["type"] == "message":
                st = "delivered" if any(u in online for u in others) else "sent"
                c = db.execute("INSERT INTO messages(conv_id,sender_id,body,status,created_at) VALUES(?,?,?,?,?)", (cid, uid, d["body"], st, time.time())); db.commit()
                m = dict(db.execute("SELECT m.*,u.display_name sender,u.color sender_color FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.id=?", (c.lastrowid,)).fetchone())
                await push(others + [uid], {"type": "message", "message": m})
            elif d["type"] == "typing":
                await push(others, {"type": "typing", "conv_id": cid, "user_id": uid})
            elif d["type"] == "read":
                db.execute("UPDATE messages SET status='read' WHERE conv_id=? AND sender_id!=?", (cid, uid)); db.commit()
                await push(others, {"type": "read", "conv_id": cid})
    except WebSocketDisconnect: pass
    finally:
        online[uid].discard(ws)
        db.execute("UPDATE users SET last_seen=? WHERE id=?", (time.time(), uid)); db.commit()
