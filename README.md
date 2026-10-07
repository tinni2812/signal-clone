# Signal Clone — SDE Fullstack Assignment

A functional clone of the Signal messaging app (desktop + Android-style mobile layout) with real-time one-on-one and group chat.

**Stack:** Next.js 14 (TypeScript) · FastAPI (Python) · SQLite · WebSockets

- Live demo: https://signal-clone-sigma.vercel.app/
- API (Render): https://signal-clone-su3x.onrender.com — note: hosted on Render's free tier, so the first request after a period of inactivity can take up to a minute while the server wakes up. If the app shows "Failed to fetch", wait a moment and retry.
- API docs: https://signal-clone-su3x.onrender.com/docs
- Test logins: phones `+910000000000` … `+910000000004` (Alice, Bob, Carol, Dave, Eve) · OTP **`123456`** (mocked). Any new phone number registers a new user.
  Tip: open two browsers (one incognito) as different users to see real-time features.

## Features
**Auth** — mocked OTP login, display name, session persistence (token in `localStorage`), logout.
**Chats** — list sorted by recent activity, search, unread badges, last-message preview, online/last-seen, unread filter, pin chat, mark all read, new chat and new group dialogs.
**1:1 messaging** — real-time send/receive over WebSockets, timestamps, typing indicator, status ticks (sent → delivered → read), everything persisted in SQLite.
**Groups** — create with name + members, group messaging, member list, admin controls (add member, remove member, make admin), leave group (admin handover if the last admin leaves).
**Signal experience** — conversation list + chat pane, bubbles, emoji picker, modals, toasts, Settings (Account, Donate, General, Appearance, Chats, Calls, Notifications, Privacy, Data usage, Backups), chat context menus.
**Placeholders ("Coming soon")** — voice/video calls, stories, linked devices, real E2E encryption (mocked). Call links (create/rename/copy/delete) are functional UI backed by `localStorage`.
**Bonus** — dark mode + System/Light/Dark theme switcher, chat colour, zoom level, responsive layout (desktop / tablet / Android-style phone with bottom nav and FABs), emoji picker.

## Architecture
```
Browser (Next.js SPA)
   │  REST  (login, lists, history, group admin)      ──► FastAPI ──► SQLite (signal.db)
   └─ WebSocket /ws?token=…  (messages, typing, read)  ──►   │
                                                       connection registry (user_id → sockets)
```
- REST handles request/response data. One WebSocket per logged-in user carries live events.
- On `message`: the server **persists first**, then fans the saved row out to every member's open sockets (including the sender, which gives the sender its authoritative id/status).
- Status logic: `delivered` if any other member is connected at send time, else `sent`; `read` when a member opens the chat (`read` event).
- Presence: a user is "online" while at least one socket is open; `last_seen` is written on disconnect.

## Database schema (SQLite)
| Table | Columns | Notes |
|---|---|---|
| `users` | `id` PK, `phone` UNIQUE, `display_name`, `color`, `last_seen` | |
| `sessions` | `token` PK, `user_id` → users | bearer token from login |
| `conversations` | `id` PK, `type` CHECK(`direct`/`group`), `name`, `created_at` | direct chats have no name |
| `members` | `conv_id` → conversations (CASCADE), `user_id` → users, `role` (`admin`/`member`), PK(`conv_id`,`user_id`) | join table, holds group roles |
| `messages` | `id` PK, `conv_id` → conversations (CASCADE), `sender_id` → users, `body`, `status` (`sent`/`delivered`/`read`), `created_at` | index on (`conv_id`,`created_at`) |

Relationships: users ⟷ conversations is many-to-many through `members`; a conversation has many `messages`; each message has one sender.

## API overview
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | `{phone, otp, display_name?}` → `{token, user}` (creates user if new) |
| GET | `/users?q=` | search users (+ online flag) |
| GET | `/conversations` | my conversations: preview, unread, status, online |
| POST | `/conversations` | `{type:"direct"\|"group", member_ids, name?}` (direct chats are de-duplicated) |
| GET | `/conversations/{id}/messages` | history (members only) |
| GET | `/conversations/{id}/members` | members + roles |
| POST | `/conversations/{id}/members` | add member (admin) |
| PATCH | `/conversations/{id}/members/{uid}` | change role (admin) |
| DELETE | `/conversations/{id}/members/{uid}` | remove member (admin) or leave (self) |
| WS | `/ws?token=` | client→server: `message`, `typing`, `read` · server→client: `message`, `typing`, `read` |

Auth: `Authorization: <token>` header on REST; `token` query param on the WebSocket.

## Run locally
```bash
# 1) backend  (http://localhost:8000)
cd backend
python3 -m venv venv && source venv/bin/activate     
pip install -r requirements.txt
python3 -m uvicorn main:app --reload

# 2) frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```
The database file and seed data (5 users, 1 direct chat, 1 group) are created automatically on first backend start. Frontend reads the API URL from `NEXT_PUBLIC_API` (default `http://localhost:8000`, see `frontend/.env.example`).

## Deployment
- **Backend → Render** (Web Service, root dir `backend`): build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`. Render supports WebSockets.
- **Frontend → Vercel** (root dir `frontend`): set env `NEXT_PUBLIC_API=https://<your-render-url>`; the app switches to `wss://` automatically.
- Vercel cannot host the backend: serverless functions don't keep WebSocket connections or a writable SQLite file.

## Assumptions & limitations
- OTP is fixed (`123456`); encryption is mocked (no real E2E).
- Message status is stored per message (fine for 1:1). For groups a per-recipient receipts table would be the next step.
- Render's free tier has an ephemeral disk and sleeps when idle, so the SQLite file resets on redeploy and the first request may take ~30–60 s. Use a paid disk or Postgres for durable data.
- Settings toggles are persisted client-side only; Read receipts / Typing indicators genuinely gate sending those events.
- CORS is open (`*`) for demo purposes; tokens never expire.

## Project structure
```
backend/   main.py (FastAPI app, schema, seed, REST + WebSocket) · requirements.txt
frontend/  app/page.tsx (UI + state) · app/globals.css (themes, responsive) · app/layout.tsx
```
