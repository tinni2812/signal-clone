"use client";
import { useEffect, useRef, useState } from "react";
const API = process.env.NEXT_PUBLIC_API || "http://localhost:8000";
const WS = API.replace("http", "ws") + "/ws";
const P: Record<string, string> = {
  menu: "M3 6h18M3 12h18M3 18h18", chat: "M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-4-1L3 21l1.9-4.9A8.4 8.4 0 1 1 21 11.5z",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  stories: "M8 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM4 7v10",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  compose: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  dots: "M5 12h.01M12 12h.01M19 12h.01", search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3", filter: "M3 6h18M7 12h10M10 18h4",
  video: "M23 7l-7 5 7 5V7zM3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  smile: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4", plus: "M12 5v14M5 12h14",
  link: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", back: "M19 12H5M12 19l-7-7 7-7", send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0", lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2", heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z", at: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8",
  archive: "M21 8v13H3V8M1 3h22v5H1zM10 12h4", folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z", chev: "M9 18l6-6-6-6", chevd: "M6 9l6 6 6-6",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  ext: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3", laptop: "M4 5h16v11H4zM2 20h20",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z", contrast: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 2v20",
  palette: "M12 22a10 10 0 1 1 10-10c0 2-2 3-4 3h-2a2 2 0 0 0-1 3.7c.5.8 0 3.3-3 3.3zM7.5 11h.01M10 7h.01M15 7h.01", zoom: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3M11 8v6M8 11h6",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6", copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  share: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14", usercheck: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 11l2 2 4-4",
  pin: "M12 17v5M9 3h6l-1 7 4 4H6l4-4z", bellOff: "M13.7 21a2 2 0 0 1-3.4 0M18 8a6 6 0 0 0-9.3-5M6.3 6.3A6 6 0 0 0 6 8c0 7-3 9-3 9h14M1 1l22 22",
  timer: "M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5l3 2M9 1h6", image: "M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
  check: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 12l3 3 5-6", block: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM5 5l14 14",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9", x: "M18 6L6 18M6 6l12 12",
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", dotsv: "M12 5h.01M12 12h.01M12 19h.01",
};
const Ic = ({ n, s = 20 }: { n: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={P[n]} /></svg>);
const ini = (n: string) => n.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const Av = ({ name, color, group, size = 40 }: any) => group
  ? <div className="av" style={{ width: size, height: size, background: "#e8e2cf", color: "#7a6a3a" }}><Ic n="users" s={size * .5} /></div>
  : <div className="av" style={{ width: size, height: size, background: color + "33", color, fontSize: size * .38 }}>{ini(name)}</div>;
const ago = (ts: number) => { const s = Date.now() / 1000 - ts; return s < 60 ? "Now" : s < 3600 ? Math.floor(s / 60) + "m" : s < 86400 ? Math.floor(s / 3600) + "h" : new Date(ts * 1000).toLocaleDateString([], { weekday: "short" }); };
const hm = (ts: number) => new Date(ts * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const tick = (s: string) => (s === "sent" ? "✓" : "✓✓");
const SET = [["account", "user", "Account"], ["donate", "heart", "Donate to Signal"], ["-"], ["general", "gear", "General"], ["appearance", "sun", "Appearance"], ["chats", "chat", "Chats"], ["calls", "phone", "Calls"], ["notifications", "bell", "Notifications"], ["privacy", "lock", "Privacy"], ["data", "clock", "Data usage"], ["backups", "clock", "Backups"]];
const COLORS = ["#2c6bed", "#6c4fd9", "#e0457b", "#2ca58d", "#f2a900", "#e8590c"];

const EMO = [
  "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😛 😜 🤪 🤔 🤨 😐 😶 🙄 😏 😴 😌 😔 😷 🤒 🥵 🥶 🤯 🤠 😎 🤓 😕 😮 😲 😳 🥺 😢 😭 😱 😞 😤 😡 🤬 😈 💀".split(" "),
  "👍 👎 👌 ✌️ 🤞 🤟 🤘 👈 👉 👆 👇 👋 ✋ 👏 🙌 🤝 🙏 💪 🫶 🤙 👀 🧠".split(" "),
  "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 💕 💖 💗 💯 🔥 ✨ ⭐ 🎉 🎊 💥 💫 ✅ ❌ ❗ ❓".split(" "),
  "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🌹 🌸 🌞 🌈 ☕ 🍕 🍔 🍟 🍰 🎂 ⚽ 🏀 🎮 🎵 📱 💻 ✈️ 🚗 🏠".split(" "),
];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const tog = (k: string, l: string, s?: string, d = false) => ({ t: "tog", k, l, s, d });
const sel = (k: string, l: string, o: string[], s?: string, i?: string, d?: string) => ({ t: "sel", k, l, o, s, i, d });
const nav = (l: string, s?: string, v?: string, i?: string) => ({ t: "nav", l, s, v, i });
const btn = (l: string, b: string, s?: string, red = false, a?: string) => ({ t: "btn", l, b, s, red, a });
const val = (l: string, v: string) => ({ t: "val", l, v });
const U = undefined;
const SETTINGS: Record<string, any[]> = {
  general: [
    { r: [val("Phone Number", "@phone"), val("Device Name", "Web")], hint: "To change the name of this device, open Signal on your phone and navigate to Settings > Linked devices" },
    { h: "System", r: [tog("login", "Open at computer login")] },
    { h: "Permissions", r: [tog("mic", "Allow access to the microphone"), tog("cam", "Allow access to the camera")] },
    { h: "Updates", r: [tog("upd", "Automatically download updates", U, true)] },
    { r: [btn("Delete application data", "Delete data", "This will delete all data in the application, removing all messages and saved account information.", true, "delete")] }],
  appearance: [{ r: [nav("Language", U, "System Language", "globe"), sel("theme", "Theme", ["System", "Light", "Dark"], U, "contrast"), { t: "color", l: "Chat color", i: "palette" }, sel("zoom", "Zoom level", ["75%", "100%", "125%", "150%"], U, "zoom", "100%")] }],
  chats: [
    { r: [tog("addr", "Use address book photos", "Display contact photos from your address book if available."), tog("muted", "Keep muted chats archived", "Muted chats that are archived will remain archived when a new message arrives.")] },
    { h: "Text input", r: [tog("spell", "Spell check text entered in message composition box", U, true), tog("fmt", "Show text formatting popover when text is selected", U, true), tog("links", "Generate link previews", "Retrieve link previews directly from websites for messages you send.", true), tog("emot", "Convert typed emoticons to emoji", "For example, :-) will be converted to 🙂", true), { t: "skin", l: "Emoji skin tone" }] },
    { h: "Chat folders", r: [nav("Add a chat folder", "Organize your chats into folders and quickly switch between them on your chat list.")] },
    { r: [btn("Export chat history", "Export", "Export a machine-readable JSON copy of all your chats. Disappearing messages will not be exported.", false, "export")] },
    { r: [btn("Import contacts", "Import now", "Import all Signal groups and contacts from your mobile device.")] }],
  calls: [
    { r: [tog("inc", "Enable incoming calls", U, true), tog("snd", "Play calling sounds", U, true)] },
    { h: "Devices", r: [sel("vid_dev", "Video", ["Default camera"]), sel("mic_dev", "Microphone", ["Default microphone"]), sel("spk_dev", "Speakers", ["Default speakers"])] },
    { h: "Advanced", r: [tog("relay", "Always relay calls", "Relay all calls through the Signal server to avoid revealing your IP address to your contact. Enabling will reduce call quality.")] }],
  notifications: [
    { r: [tog("notif", "Enable notifications", U, true), sel("show", "Show", ["Name, content, and actions", "Name only", "No name or content"]), nav("While muted", "Choose notifications to show for muted chats.", "Mentions, replies")] },
    { r: [tog("react", "Reaction notifications", "Notify when someone reacts to your message", true), tog("remind", "Unread reminders", "Occasionally notify when there are unread messages in muted chats.", true)] },
    { h: "Sounds", r: [tog("push", "Push notification sounds"), tog("inchat", "In-chat message sounds", "Hear a notification sound for sent and received messages while in the chat.")] },
    { h: "Unread badges", r: [sel("badge", "Badge count", ["Unread messages", "Unread chats"], "Select if the badge count displays the number of unread messages or the number of unread chats"), tog("mbadge", "Include muted chats in app badge", "Chat folder badges will always include muted chats")] },
    { r: [nav("Notification profiles", "Add or edit notification profiles")] },
    { r: [btn("Reset notification settings to default, including custom settings for your chats.", "Reset", U, true, "reset")] }],
  privacy: [
    { r: [nav("Phone Number", "Choose who can see your phone number and who can contact you on Signal with it.")] },
    { r: [{ t: "nav", l: "Blocked", s: "No users or groups", dis: true }] },
    { h: "Messaging", r: [tog("rr", "Read receipts", U, true), tog("typ", "Typing indicators", U, true)], hint: "See and share when message are being read and typed. If disabled, you won’t see read receipts or typing indicators from others." },
    { h: "Disappearing messages", r: [sel("timer", "Default timer for new chats", ["Off", "30 seconds", "5 minutes", "1 hour", "1 day", "1 week"], "Set a default disappearing message timer for all new chats started by you.")] },
    { h: "Stories", r: [btn("Share & View Stories", "Turn off stories", "If you opt out of stories you will no longer be able to share or view stories.", true)] },
    { h: "Advanced", r: [tog("sealed", "Show status icon", "Show an icon in message details when they were delivered using sealed sender."), tog("akv", "Automatic key verification", "When enabled, Signal will attempt to automatically verify the encryption of 1:1 chats.", true)] }],
  data: [
    { h: "Media auto-download", r: [tog("ph", "Photos", U, true), tog("vd", "Videos", U, true), tog("au", "Audio", U, true), tog("dc", "Documents", U, true)], hint: "Voice messages and stickers are always auto-downloaded." },
    { r: [sel("quality", "Sent media quality", ["Standard", "High"], "Sending high quality media will use more data.")] }],
};

const MSET = [["account", "user", "Account"], ["devices", "laptop", "Linked devices"], ["donate", "heart", "Donate to Signal"], ["-"], ["appearance", "sun", "Appearance"], ["chats", "chat", "Chats"], ["stories", "stories", "Stories"], ["notifications", "bell", "Notifications"], ["privacy", "lock", "Privacy"], ["backups", "clock", "Backups"], ["data", "clock", "Data usage"]];
SETTINGS.stories = [{ r: [nav("Story privacy", "Choose who can view your stories"), tog("vr", "View receipts", "See and share when stories are viewed.", true)] }];
SETTINGS.devices = [{ r: [nav("Link a new device", "Scan a QR code from your phone")], hint: "Linked devices are a placeholder in this demo." }];

export default function Home() {
  const [auth, setAuth] = useState<any>(null);
  const [tab, setTab] = useState("chats"); const [sec, setSec] = useState("profile");
  const [theme, setTheme] = useState("system"); const [accent, setAccent] = useState("#2c6bed");
  const [convs, setConvs] = useState<any[]>([]); const [active, setActive] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]); const [mem, setMem] = useState<any[]>([]);
  const [text, setText] = useState(""); const [q, setQ] = useState(""); const [toast, setToast] = useState("");
  const [typing, setTyping] = useState(false); const [modal, setModal] = useState<string | null>(null);
  const [people, setPeople] = useState<any[]>([]); const [mq, setMq] = useState(""); const [gname, setGname] = useState(""); const [sel, setSel] = useState<number[]>([]);
  const [f, setF] = useState({ phone: "+910000000000", otp: "123456" });
  const [railOpen, setRailOpen] = useState(false); const [unreadOnly, setUnreadOnly] = useState(false);
  const [menu, setMenu] = useState<string | null>(null); const [sub, setSub] = useState(false);
  const [emoji, setEmoji] = useState(false); const [ecat, setEcat] = useState(0);
  const [prefs, setPrefs] = useState<any>({}); const [colorOpen, setColorOpen] = useState(false);
  const prefsRef = useRef<any>({}); const inp = useRef<HTMLInputElement>(null);
  const [links, setLinks] = useState<any[]>([]); const [selCall, setSelCall] = useState<number | null>(null); const [callModal, setCallModal] = useState<number | null>(null);
  const [callMissed, setCallMissed] = useState(false); const [newCall, setNewCall] = useState(false); const [cu, setCu] = useState<any[]>([]);
  const [storyModal, setStoryModal] = useState(false); const [gs, setGs] = useState(false); const [sk, setSk] = useState<string | null>(null); const [secOpen, setSecOpen] = useState(false); const [mob, setMob] = useState(false); const [mSearch, setMSearch] = useState(false);
  const ws = useRef<WebSocket | null>(null); const aref = useRef<any>(null); const end = useRef<HTMLDivElement>(null);
  aref.current = active; prefsRef.current = prefs;
  const say = (t = "Coming soon") => setToast(t);
  const j = (p: string, o: any = {}) => fetch(API + p, { ...o, headers: { Authorization: auth.token, "Content-Type": "application/json" } }).then(r => r.json());
  const loadConvs = () => j("/conversations").then(setConvs);
  const pickTheme = (t: string) => { setTheme(t); localStorage.setItem("theme", t); };
  const pickAccent = (c: string) => { setAccent(c); localStorage.setItem("accent", c); };
  const setPref = (k: string, v: any) => { const n = { ...prefs, [k]: v }; setPrefs(n); localStorage.setItem("prefs", JSON.stringify(n)); };

  useEffect(() => {
    const s = localStorage.getItem("auth"); if (s) setAuth(JSON.parse(s));
    setTheme(localStorage.getItem("theme") || "system"); setAccent(localStorage.getItem("accent") || "#2c6bed"); setPrefs(JSON.parse(localStorage.getItem("prefs") || "{}"));
  }, []);
  useEffect(() => {
    const mql = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { document.documentElement.dataset.theme = theme === "system" ? (mql.matches ? "dark" : "light") : theme; };
    apply(); mql.addEventListener("change", apply); return () => mql.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => { document.documentElement.style.setProperty("--accent", accent); }, [accent]);
  useEffect(() => { setLinks(JSON.parse(localStorage.getItem("links") || "[]")); }, []);
  useEffect(() => { if (tab !== "settings") setSecOpen(false); }, [tab]);
  useEffect(() => { const m = matchMedia("(max-width: 760px)"); const f = () => setMob(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  useEffect(() => { if (auth && (newCall || storyModal || gs)) j("/users?q=").then(setCu); }, [newCall, storyModal, gs]);
  useEffect(() => {
    if (!auth) return; loadConvs();
    const w = new WebSocket(`${WS}?token=${auth.token}`); ws.current = w;
    w.onmessage = e => {
      const d = JSON.parse(e.data), a = aref.current;
      if (d.type === "message") {
        if (a?.id === d.message.conv_id) { setMsgs(m => [...m, d.message]); if (d.message.sender_id !== auth.user.id && prefsRef.current.rr !== false) w.send(JSON.stringify({ type: "read", conv_id: a.id })); }
        else if (d.message.sender_id !== auth.user.id && !prefsRef.current["mute_" + d.message.conv_id]) say(`${d.message.sender}: ${d.message.body}`);
        loadConvs();
      } else if (d.type === "typing" && a?.id === d.conv_id) { setTyping(true); setTimeout(() => setTyping(false), 1500); }
      else if (d.type === "read") { if (a?.id === d.conv_id) setMsgs(m => m.map(x => ({ ...x, status: "read" }))); loadConvs(); }
    };
    return () => w.close();
  }, [auth]);
  useEffect(() => { end.current?.scrollIntoView(); }, [msgs]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2500); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => { if (auth && modal) j("/users?q=" + encodeURIComponent(mq)).then(setPeople); }, [modal, mq]);

  const open = async (c: any) => {
    setTab("chats"); setActive(c); setMsgs(await j(`/conversations/${c.id}/messages`));
    setMem(c.type === "group" ? await j(`/conversations/${c.id}/members`) : []);
    if (prefsRef.current.rr !== false) ws.current?.send(JSON.stringify({ type: "read", conv_id: c.id })); loadConvs();
  };
  const startDirect = async (u: any) => {
    const { id } = await j("/conversations", { method: "POST", body: JSON.stringify({ type: "direct", member_ids: [u.id] }) });
    setModal(null); await loadConvs(); open({ id, type: "direct", name: u.display_name, color: u.color });
  };
  const makeGroup = async () => {
    if (!gname.trim() || !sel.length) return say("Add a name and at least one member");
    const { id } = await j("/conversations", { method: "POST", body: JSON.stringify({ type: "group", name: gname, member_ids: sel }) });
    setModal(null); setGname(""); setSel([]); await loadConvs(); open({ id, type: "group", name: gname, color: "#888" });
  };
  const send = () => { if (!text.trim()) return; ws.current?.send(JSON.stringify({ type: "message", conv_id: active.id, body: text })); setText(""); };
  const login = async () => {
    const r = await fetch(API + "/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json(); if (!r.ok) return say(d.detail);
    localStorage.setItem("auth", JSON.stringify(d)); setAuth(d);
  };
  const logout = () => { localStorage.removeItem("auth"); setAuth(null); setActive(null); };

  if (!auth) return (<div className="app"><div className="login"><h2>Signal</h2><small className="sub">Seed phones +910000000000 … 04 · OTP 123456</small>
    <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="Phone number" />
    <input value={f.otp} onChange={e => setF({ ...f, otp: e.target.value })} placeholder="Verification code" />
    <button className="btn" onClick={login}>Continue</button></div>{toast && <div className="toast">{toast}</div>}</div>);

  const Pop = ({ k, items, cls = "" }: any) => menu === k ? <><div className="scrim" onClick={() => setMenu(null)} /><div className={"pop " + cls}>{items.map((it: any, n: number) =>
    it.sep ? <hr key={n} className="ps" /> :
    it.sub ? <div key={it.l} className={"pi" + (sk === it.l ? " on" : "")} role="button" onMouseEnter={() => setSk(it.l)} onClick={() => setSk(sk === it.l ? null : it.l)}><Ic n={it.i} s={18} /><span style={{ flex: 1 }}>{it.l}</span><Ic n="chev" s={16} />
      {sk === it.l && <div className="pop sub" onClick={e => e.stopPropagation()}>{it.sub.map((o: string) => <button key={o} className="pi" onClick={() => { setMenu(null); setSk(null); it.f(o); }}>{o}</button>)}</div>}</div> :
    <button key={it.l} className={"pi" + (it.red ? " rd" : "")} onMouseEnter={() => setSk(null)} onClick={() => { setMenu(null); it.f(); }}>{it.i && <Ic n={it.i} s={18} />}{it.l}</button>)}</div></> : null;
  const Head = ({ title, icon, onIcon, chats, dots, plusMenu }: any) => (<div className="ph"><h1>{title}</h1>
    <span style={{ position: "relative" }}><button className="ib" onClick={() => plusMenu ? setMenu(menu === "plus" ? null : "plus") : onIcon()}><Ic n={icon} /></button>{plusMenu && <Pop k="plus" items={plusMenu} />}</span>
    <span style={{ position: "relative" }}><button className="ib" onClick={() => { if (chats) { setMenu(menu ? null : "chats"); setSub(false); } else if (dots) setMenu(menu === "dots" ? null : "dots"); else say(); }}><Ic n="dots" /></button>
      {dots && <Pop k="dots" items={dots} />}
      {chats && menu === "chats" && <><div className="scrim" onClick={() => setMenu(null)} /><div className="pop">
        <button className="pi" onClick={() => { setMenu(null); say(); }}><Ic n="archive" s={18} />View Archive</button>
        <button className="pi" onClick={() => { setMenu(null); say(); }}><Ic n="folder" s={18} />Add chat folder</button>
        <div className={"pi" + (sub ? " on" : "")} role="button" onMouseEnter={() => setSub(true)} onClick={() => setSub(x => !x)}><Ic n="moon" s={18} /><span style={{ flex: 1 }}>Notification profile</span><Ic n="chev" s={16} />
          {sub && <div className="pop sub" onClick={e => e.stopPropagation()}><b style={{ padding: "8px 10px", display: "block" }}>Notification Profile</b>
            <button className="pi" onClick={() => { setMenu(null); setTab("settings"); setSec("notifications"); setSecOpen(true); }}><Ic n="gear" s={18} />Settings</button></div>}</div>
      </div></>}</span></div>);
  // plain function (not a component) so the <input> keeps focus while typing
  const search = (filter?: string) => { const on = filter === "unread" ? unreadOnly : filter === "missed" ? callMissed : false;
    return (<div className="sr"><div className="sb"><Ic n="search" s={16} /><input placeholder={on ? `Search ${filter} ${filter === "unread" ? "chats" : "calls"}` : "Search"} value={q} onChange={e => setQ(e.target.value)} /></div>
      {filter && <button className={"ib" + (on ? " fon" : "")} onClick={() => filter === "unread" ? setUnreadOnly(u => !u) : setCallMissed(m => !m)}><Ic n="filter" /></button>}</div>); };
  const shown = convs.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) && (!unreadOnly || c.unread > 0)).sort((x, y) => ((prefs.pins || []).includes(y.id) ? 1 : 0) - ((prefs.pins || []).includes(x.id) ? 1 : 0));
  const name = auth.user.display_name;

  const gv = (k: string, d: any) => prefs[k] ?? d;
  const z = parseInt(prefs.zoom || "100") / 100;
  const exportChats = async () => {
    const out: any = {}; for (const c of convs) out[c.name] = await j(`/conversations/${c.id}/messages`);
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" })); a.download = "signal-chats.json"; a.click();
  };
  const act = (a?: string) => { if (a === "delete") { localStorage.clear(); location.reload(); } else if (a === "reset") { setPrefs({}); localStorage.removeItem("prefs"); say("Notification settings reset"); } else if (a === "export") exportChats(); else say(); };
  const row = (r: any, x: number) => (<div key={x}>
    <div className={"cr2" + (r.dis ? " dis" : "") + (r.t === "nav" || r.t === "color" ? " click" : "")} onClick={r.t === "nav" && !r.dis ? () => say() : r.t === "color" ? () => setColorOpen(o => !o) : undefined}>
      <div className="rl">{r.i && <Ic n={r.i} />}<div><div>{r.l}</div>{r.s && <div className="sub">{r.s}</div>}</div></div>
      <div className="rr">
        {r.t === "tog" && <button className={"tg" + (gv(r.k, r.d) ? " on" : "")} onClick={() => setPref(r.k, !gv(r.k, r.d))}><i /></button>}
        {r.t === "sel" && <span className="psel"><select value={r.k === "theme" ? cap(theme) : gv(r.k, r.d ?? r.o[0])} onChange={e => r.k === "theme" ? pickTheme(e.target.value.toLowerCase()) : setPref(r.k, e.target.value)}>{r.o.map((o: string) => <option key={o}>{o}</option>)}</select><Ic n="chevd" s={14} /></span>}
        {r.t === "val" && <span>{r.v === "@phone" ? auth.user.phone : r.v}</span>}
        {r.t === "nav" && <><span>{r.v}</span><Ic n="chev" s={16} /></>}
        {r.t === "color" && <><span className="dotc" style={{ background: accent }} /><Ic n="chev" s={16} /></>}
        {r.t === "btn" && <button className={"pill" + (r.red ? " red" : "")} onClick={() => act(r.a)}>{r.b}</button>}
        {r.t === "skin" && <div className="skin">{["✋", "✋🏻", "✋🏼", "✋🏽", "✋🏾", "✋🏿"].map((h, n) => <button key={n} className={gv("skin", 0) === n ? "on" : ""} onClick={() => setPref("skin", n)}>{h}</button>)}</div>}
      </div></div>
    {r.t === "color" && colorOpen && <div className="cr2" style={{ justifyContent: "flex-start", gap: 12 }}>{COLORS.map(c => <button key={c} className={"sw" + (accent === c ? " on" : "")} style={{ background: c }} onClick={() => pickAccent(c)} />)}</div>}
  </div>);
  const renderSet = () => {
    const title = String((SET.find(s => s[0] === sec) || MSET.find(s => s[0] === sec))?.[2]);
    if (sec === "account") return (<div className="pane"><b>Account</b><div className="blk"><div className="card"><div className="cr2 click" onClick={() => say()}><div className="rl"><Ic n="laptop" /><div><div>This is a linked device</div><div className="sub">To manage your account settings, open Signal on your primary device.</div></div></div><Ic n="chev" s={16} /></div></div></div></div>);
    if (sec === "donate") return (<div className="pane"><b>Donate to Signal</b><Av name={name} color="#2c6bed" size={110} /><h2 style={{ fontSize: 20, margin: 0 }}>Proudly nonprofit</h2>
      <div className="sub" style={{ textAlign: "center", maxWidth: 320 }}>Donate to support private messaging. Keep Signal independent and ad-free. <a style={{ color: accent }}>Read more</a></div>
      <button className="btn" style={{ borderRadius: 20, padding: "10px 28px" }} onClick={() => say()}>Donate</button>
      <div className="blk"><hr style={{ margin: "16px 0" }} /><div className="cr2 click" onClick={() => say()}><div className="rl"><Ic n="help" />Donor FAQs</div><Ic n="ext" s={18} /></div><div className="hint">Badges and monthly donations can be managed on your mobile device.</div></div></div>);
    if (sec === "backups") return (<div className="pane"><b>Backups</b><div className="blk"><div className="sub" style={{ padding: "4px 12px" }}>Back up your message history so you never lose data when you get a new phone or reinstall Signal.</div>
      <div className="cr2"><div className="rl"><Ic n="clock" /><div><div>Signal Secure Backups</div><div className="sub">Automatic backups with Signal’s secure, end-to-end encrypted storage service. Get started on your phone. <a style={{ color: accent }}>Learn more.</a></div></div></div></div><hr />
      <h2 className="bh">Other ways to back up</h2><div className="cr2"><div className="rl"><Ic n="laptop" /><div><div>Desktop backups</div><div className="sub">Create an end-to-end encrypted backup that you can restore on your phone.</div></div></div><button className="pill" onClick={() => say()}>Set up</button></div></div></div>);
    const blocks = SETTINGS[sec];
    if (!blocks) return <div className="empty" style={{ margin: "auto" }}><h3>{title}</h3>Coming soon</div>;
    return (<div className="pane"><b>{title}</b>{blocks.map((bl: any, i: number) => (<div key={i} className="blk">{bl.h && <h2 className="bh">{bl.h}</h2>}<div className="card">{bl.r.map(row)}</div>{bl.hint && <div className="hint">{bl.hint}</div>}</div>))}</div>);
  };

  const mkKey = () => Array.from({ length: 7 }, () => Array.from({ length: 4 }, () => "abcdefghjkmnpqrstuvwxyz"[Math.floor(Math.random() * 23)]).join("")).join("-");
  const saveLinks = (v: any[]) => { setLinks(v); localStorage.setItem("links", JSON.stringify(v)); };
  const updLink = (id: number, patch: any) => saveLinks(links.map(l => l.id === id ? { ...l, ...patch } : l));
  const linkUrl = (l: any) => `signal.link/call/#key=${l.key}`;
  const newLink = () => { const l = { id: Date.now(), ts: Date.now() / 1000, key: mkKey(), name: "", approval: true }; saveLinks([l, ...links]); setCallModal(l.id); };
  const rename = (l: any) => { const n = prompt("Call name", l.name || ""); if (n !== null) updLink(l.id, { name: n.trim() }); };
  const copy = (l: any) => { navigator.clipboard?.writeText("https://" + linkUrl(l)); say("Link copied"); };
  const STORY_ITEMS = [{ l: "Photo or video", f: () => say("Stories are a placeholder") }, { l: "Text story", f: () => say("Stories are a placeholder") }];
  const jm = async (p: string, o: any = {}) => { const r = await j(p, o); if (r?.detail) say(r.detail); return r; };
  const refreshMem = async () => { if (active) setMem(await j(`/conversations/${active.id}/members`)); loadConvs(); };
  const addM = async (id: number) => { await jm(`/conversations/${active.id}/members`, { method: "POST", body: JSON.stringify({ user_id: id }) }); refreshMem(); };
  const rmM = async (id: number) => { await jm(`/conversations/${active.id}/members/${id}`, { method: "DELETE" }); refreshMem(); };
  const promote = async (id: number) => { await jm(`/conversations/${active.id}/members/${id}`, { method: "PATCH", body: JSON.stringify({ role: "admin" }) }); refreshMem(); };
  const leaveGroup = async () => { if (!confirm("Leave this group?")) return; await jm(`/conversations/${active.id}/members/${auth.user.id}`, { method: "DELETE" }); setGs(false); setActive(null); loadConvs(); };
  const isGroup = active?.type === "group";
  const isAdmin = mem.find(m => m.id === auth.user.id)?.role === "admin";
  const pins: number[] = prefs.pins || [];
  const chatMenu: any[] = active ? [
    { l: "Disappearing messages", i: "timer", sub: ["Off", "30 seconds", "5 minutes", "1 hour", "1 day", "1 week"], f: (o: string) => say(`Disappearing messages: ${o}`) },
    { l: "Mute notifications", i: "bellOff", sub: ["1 hour", "8 hours", "1 day", "1 week", "Always", "Unmute"], f: (o: string) => { setPref("mute_" + active.id, o === "Unmute" ? null : o); say(o === "Unmute" ? "Unmuted" : `Muted: ${o}`); } },
    ...(isGroup ? [{ l: "Group settings", i: "gear", f: () => setGs(true) }] : []),
    { l: "All media", i: "image", f: () => say() }, { sep: true },
    { l: "Select messages", i: "check", f: () => say() }, { sep: true },
    { l: "Mark as unread", i: "chat", f: () => say() },
    { l: pins.includes(active.id) ? "Unpin chat" : "Pin chat", i: "pin", f: () => setPref("pins", pins.includes(active.id) ? pins.filter(x => x !== active.id) : [...pins, active.id]) },
    { l: "Archive", i: "archive", f: () => say() }, { l: "Block", i: "block", f: () => say() }, { l: "Delete", i: "trash", f: () => say() },
    ...(isGroup ? [{ l: "Leave group", i: "logout", f: leaveGroup }] : []),
  ] : [];
  const markAllRead = () => { convs.filter(c => c.unread > 0).forEach(c => ws.current?.send(JSON.stringify({ type: "read", conv_id: c.id }))); setTimeout(loadConvs, 400); say("All chats marked read"); };
  const chatDots = [{ l: "New group", i: "users", f: () => { setMq(""); setModal("group"); } }, { l: "Mark all read", i: "check", f: markAllRead }, { l: "Filter unread chats", i: "filter", f: () => setUnreadOnly(true) },
    { l: "Notification profile", i: "moon", f: () => say() }, { l: "Archived chats", i: "archive", f: () => say() }, { l: "Settings", i: "gear", f: () => { setTab("settings"); setSecOpen(false); } }];
  const callDots = [{ l: "Clear call history", i: "trash", f: () => { saveLinks([]); setSelCall(null); say("Call history cleared"); } }];
  const storyDots = [{ l: "Story privacy", f: () => setStoryModal(true) }];
  // Android-style header (plain function so the search <input> keeps focus)
  const mHead = (items: any[]) => mSearch
    ? <div className="msb"><button className="ib" onClick={() => { setMSearch(false); setQ(""); }}><Ic n="back" s={24} /></button><input autoFocus placeholder="Search" value={q} onChange={e => setQ(e.target.value)} /></div>
    : <div className="mh"><button className="mav" onClick={() => { setTab("settings"); setSecOpen(false); }}><Av name={name} color="#2c6bed" size={36} /></button><h1>Signal</h1>
        <button className="ib" onClick={() => setMSearch(true)}><Ic n="search" s={24} /></button>
        <span style={{ position: "relative" }}><button className="ib" onClick={() => setMenu(menu === "dots" ? null : "dots")}><Ic n="dotsv" s={24} /></button><Pop k="dots" items={items} /></span></div>;
  const detail = (tab === "chats" && !!active) || (tab === "settings" && secOpen) || (tab === "calls" && selCall != null);
  const backBtn = <button className="ib mb back" onClick={() => setSecOpen(false)}><Ic n="back" /></button>;

  return (
    <div className="app" style={{ zoom: z, height: `calc(100dvh / ${z})` }}>
      <nav className={"rail" + (railOpen ? " open" : "") + (detail || (mob && tab === "settings") ? " hide" : "")}>
        <button className="ri menu" onClick={() => setRailOpen(o => !o)}><Ic n="menu" /></button>
        {[["chats", "chat", "Chats"], ["calls", "phone", "Calls"], ["stories", "stories", "Stories"]].map(([t, i, l]) =>
          <button key={t} className={"ri" + (tab === t ? " on" : "")} onClick={() => { setTab(t); setQ(""); setMSearch(false); }}><em className="ico"><Ic n={i} /></em>{(railOpen || mob) && <span className="lb">{l}</span>}</button>)}
        <div className="spacer" style={{ flex: 1 }} />
        <button className={"ri gear" + (tab === "settings" ? " on" : "")} onClick={() => setTab("settings")}><Ic n="gear" />{railOpen && <span>Settings</span>}</button>
      </nav>

      <section className={"panel" + (detail ? " hide" : "")}>
        {tab === "chats" && <>{mob ? mHead(chatDots) : <><Head chats title="Chats" icon="compose" onIcon={() => { setMq(""); setModal("new"); }} />{search("unread")}</>}{unreadOnly && <div className="hint2">Filtered by unread{mob && <button className="pill" style={{ marginLeft: 12 }} onClick={() => setUnreadOnly(false)}>Clear</button>}</div>}
          <div className="list">{unreadOnly && !shown.length && <div className="empty" style={{ marginTop: 60 }}><span style={{ color: "var(--txt)" }}>No unread chats</span><button className="pill" onClick={() => setUnreadOnly(false)}>Clear filter</button></div>}{shown.map(c => (
            <button key={c.id} className={"row" + (active?.id === c.id ? " on" : "")} onClick={() => open(c)}>
              <Av name={c.name} color={c.color} group={c.type === "group"} size={mob ? 56 : 44} />
              <div className="meta"><div className="l1"><b>{c.name}</b><span>{ago(c.ts)}</span></div>
                <div className="l2"><span className="pv">{c.last}</span>
                  {c.mine && <span className="sub">{tick(c.status)}</span>}{c.unread > 0 && <span className="badge">{c.unread}</span>}</div></div></button>))}</div>{mob && !mSearch && <div className="fabs"><button className="fab" onClick={() => say()}><Ic n="camera" s={26} /></button><button className="fab pri" onClick={() => { setMq(""); setModal("new"); }}><Ic n="edit" s={26} /></button></div>}</>}

        {tab === "calls" && (newCall ? <>
          <div className="ph"><button className="ib" onClick={() => setNewCall(false)}><Ic n="back" /></button><h1 style={{ textAlign: "center", fontSize: 16 }}>New Call</h1><span style={{ width: 32 }} /></div>
          {search()}
          <div className="list"><h2 className="bh">Contacts</h2>
            {cu.filter(u => u.display_name.toLowerCase().includes(q.toLowerCase())).map(u => <div key={u.id} className="row"><Av name={u.display_name} color={u.color} size={36} /><span style={{ flex: 1 }}>{u.display_name}</span>
              <button className="ib" onClick={() => say("Voice calls are a placeholder")}><Ic n="phone" /></button><button className="ib" onClick={() => say("Video calls are a placeholder")}><Ic n="video" /></button></div>)}
            <h2 className="bh">Groups</h2>
            {convs.filter(c => c.type === "group" && c.name.toLowerCase().includes(q.toLowerCase())).map(c => <div key={c.id} className="row"><Av name={c.name} group size={36} /><span style={{ flex: 1 }}>{c.name}</span>
              <button className="ib" onClick={() => say("Video calls are a placeholder")}><Ic n="video" /></button></div>)}</div></> : <>
          {mob ? mHead(callDots) : <Head title="Calls" icon="phone" onIcon={() => { setQ(""); setNewCall(true); }} dots={callDots} />}
          {!mob && search("missed")}{callMissed && <div className="hint2">Filtered by missed</div>}
          <div className="list">{callMissed ? <div className="empty" style={{ marginTop: 60 }}><span style={{ color: "var(--txt)" }}>No missed calls</span><button className="pill" onClick={() => setCallMissed(false)}>Clear filter</button></div> : <>
            <button className="row" onClick={newLink}><div className="av" style={{ width: 44, height: 44, background: "var(--sel)" }}><Ic n="link" /></div><div className="meta"><span>Create a Call Link</span>{mob && <div className="sub">Share a link for a Signal call</div>}</div></button>
            {links.filter(l => (l.name || "Signal Call").toLowerCase().includes(q.toLowerCase())).map((l, n) => <button key={l.id} className={"row" + (selCall === l.id ? " on" : "")} onClick={() => setSelCall(l.id)}>
              <div className="av" style={{ width: 44, height: 44, background: n % 2 ? "#f0e1fb" : "#fdf3cf", color: n % 2 ? "#9b3fe0" : "#8a6d1a" }}><Ic n="video" /></div>
              <div className="meta"><b>{l.name || "Signal Call"}</b><div className="sub">Call link · {ago(l.ts)}</div></div>
              <span className="ib" onClick={e => { e.stopPropagation(); say("Calls are a placeholder"); }}><Ic n="video" /></span></button>)}</>}</div>{mob && <div className="fabs"><button className="fab pri" onClick={() => { setQ(""); setNewCall(true); }}><Ic n="phone" s={26} /></button></div>}</>)}

        {tab === "stories" && <>{mob ? mHead(storyDots) : <Head title="Stories" icon="plus" plusMenu={STORY_ITEMS} dots={storyDots} />}
          <div className="sr"><div className="sb"><Ic n="search" s={16} /><input placeholder="Search" value={q} onChange={e => setQ(e.target.value)} /></div></div>
          <div className="list"><div style={{ position: "relative" }}><button className="row" onClick={() => setMenu(menu === "mystory" ? null : "mystory")}>
            <div style={{ position: "relative" }}><Av name={name} color="#2c6bed" size={48} /><span className="pbadge"><Ic n="plus" s={12} /></span></div>
            <div className="meta"><b>{mob ? "My Stories" : "My Story"}</b><div className="sub">{mob ? "Tap to add" : "Add a story"}</div></div></button><Pop k="mystory" cls="left" items={STORY_ITEMS} /></div>
            {mob ? <div className="row"><div className="av" style={{ width: 56, height: 56, background: "#3a5bf0", color: "#fff", border: "3px solid #c9d2ff" }}><Ic n="chat" s={26} /></div><div className="meta"><b>Signal ✔</b><div className="sub">11h</div></div></div> : <div className="empty" style={{ marginTop: 160 }}><h3>No stories</h3>New updates will appear here.</div>}</div>{mob && <div className="fabs"><button className="fab pri" onClick={() => say()}><Ic n="camera" s={26} /></button></div>}</>}

        {tab === "settings" && mob && <><div className="ph"><button className="ib" onClick={() => setTab("chats")}><Ic n="back" s={24} /></button><h1 style={{ marginLeft: 12, fontWeight: 400 }}>Settings</h1></div>
          <div className="list"><button className="row" style={{ padding: 16, gap: 20 }} onClick={() => { setSec("profile"); setSecOpen(true); }}><Av name={name} color="#2c6bed" size={76} /><div className="meta"><b style={{ fontSize: 22, fontWeight: 400 }}>{name}</b><div className="sub">{auth.user.phone}</div></div></button>
            {MSET.map(([k, i, l], x) => k === "-" ? <hr key={x} /> : <button key={k} className="row mrow" onClick={() => { setSec(k); setSecOpen(true); }}><Ic n={i} s={24} /><span>{l}</span></button>)}
            <hr /><button className="row mrow" onClick={logout}><Ic n="back" s={24} /><span>Log out</span></button></div></>}
        {tab === "settings" && !mob && <><div className="ph"><h1>Settings</h1></div>
          <div className="list"><button className={"row" + (sec === "profile" ? " on" : "")} onClick={() => { setSec("profile"); setSecOpen(true); }}><Av name={name} color="#2c6bed" size={48} />
            <div className="meta"><b>{name}</b><div className="sub">{auth.user.phone}</div></div></button>
            {SET.map(([k, i, l], x) => k === "-" ? <hr key={x} /> :
              <button key={k} className={"row" + (sec === k ? " on" : "")} onClick={() => { setSec(k); setSecOpen(true); }}><Ic n={i} /><span>{l}</span></button>)}
            <hr /><button className="row" onClick={logout}><Ic n="back" /><span>Log out</span></button></div></>}
      </section>

      <main className={"main" + (detail ? "" : " hide")}>
        {tab === "chats" && !active && <div className="empty" style={{ margin: "auto" }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="6"><circle cx="42" cy="38" r="30" strokeDasharray="10 7" /><path d="M12 70l6-18" strokeLinecap="round" /></svg>
          <h3>Welcome to Signal</h3><span>See <a style={{ color: accent }}>what's new</a> in this update</span></div>}

        {tab === "chats" && active && <>
          <div className="ch"><button className="ib mb" onClick={() => setActive(null)}><Ic n="back" /></button>
            <Av name={active.name} color={active.color} group={active.type === "group"} size={36} />
            <b>{active.name}{typing && <span className="sub"> · typing…</span>}</b>
            <button className="ib" onClick={() => say()}><Ic n="video" /></button><button className="ib" onClick={() => say()}><Ic n="search" /></button><span style={{ position: "relative" }}><button className="ib" onClick={() => setMenu(menu === "chatmenu" ? null : "chatmenu")}><Ic n="dots" /></button><Pop k="chatmenu" cls="lsub" items={chatMenu} /></span></div>
          <div className="scroll">
            <div className="intro" style={{ cursor: isGroup ? "pointer" : undefined }} onClick={() => isGroup && setGs(true)}><Av name={active.name} color={active.color} group={active.type === "group"} size={64} /><b>{active.name}</b>
              <span className="sub">{active.type === "group" ? <><Ic n="users" s={14} /> {mem.filter(m => m.id !== auth.user.id).map(m => m.display_name.split(" ")[0]).join(", ")}{mem.length > 1 ? " and you" : "Just you"}</> : "Say hello 👋"}</span></div>
            <div className="day">Today</div>
            {msgs.map(m => { const mine = m.sender_id === auth.user.id; return (
              <div key={m.id} className={"mr" + (mine ? " me" : "")}>
                {!mine && active.type === "group" && <Av name={m.sender} color={m.sender_color} size={28} />}
                <div className="bub">{!mine && active.type === "group" && <span className="nm" style={{ color: m.sender_color }}>{m.sender}</span>}
                  {m.body}<span className="tm">{hm(m.created_at)} {mine && tick(m.status)}</span></div></div>); })}
            <div ref={end} /></div>
          <div className="cp" style={{ position: "relative" }}>{emoji && <><div className="scrim" onClick={() => setEmoji(false)} /><div className="emo">
            <div className="et">{EMO.map((c, i) => <button key={i} className={i === ecat ? "on" : ""} onClick={() => setEcat(i)}>{c[0]}</button>)}</div>
            <div className="eg">{EMO[ecat].map(e => <button key={e} onClick={() => { setText(t => t + e); inp.current?.focus(); }}>{e}</button>)}</div></div></>}
            <button className="ib" onClick={() => setEmoji(o => !o)}><Ic n="smile" s={24} /></button>
            <input ref={inp} placeholder="Message" value={text} onChange={e => { setText(e.target.value); if (prefsRef.current.typ !== false) ws.current?.send(JSON.stringify({ type: "typing", conv_id: active.id })); }} onKeyDown={e => e.key === "Enter" && send()} />
            {text.trim() ? <button className="send" onClick={send}><Ic n="send" s={16} /></button> : <><button className="ib" onClick={() => say()}><Ic n="mic" /></button><button className="ib" onClick={() => say()}><Ic n="plus" /></button></>}</div></>}

        {tab === "calls" && (() => { const l = links.find(x => x.id === selCall);
          if (!l) return <div className="empty" style={{ margin: "auto" }}><Ic n="phone" s={40} />Click the call icon to start a new voice or video call.</div>;
          return (<div className="pane"><button className="ib mb back" onClick={() => setSelCall(null)}><Ic n="back" /></button><div className="blk">
            <div className="cr2" style={{ gap: 16 }}><div className="av" style={{ width: 90, height: 90, background: "#fdf3cf", color: "#8a6d1a" }}><Ic n="video" s={40} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><h2 style={{ margin: 0, fontSize: 20 }}>{l.name || "Signal Call"}</h2><div className="sub" style={{ wordBreak: "break-all" }}>{linkUrl(l)}</div></div>
              <button className="join" onClick={() => say("Calls are a placeholder")}>Join</button></div>
            <h2 className="bh">Today</h2><div className="card"><div className="cr2"><div className="rl"><Ic n="link" />Call link</div><span className="sub">{ago(l.ts)}</span></div></div>
            <div className="card" style={{ marginTop: 16 }}><div className="cr2 click" onClick={() => rename(l)}><div className="rl"><Ic n="edit" />Add call name</div><Ic n="chev" s={16} /></div>
              <div className="cr2"><div className="rl"><Ic n="usercheck" />Require admin approval</div><button className={"tg" + (l.approval ? " on" : "")} onClick={() => updLink(l.id, { approval: !l.approval })}><i /></button></div></div>
            <div className="card" style={{ marginTop: 16 }}><div className="cr2 click" onClick={() => copy(l)}><div className="rl"><Ic n="copy" />Copy link</div></div>
              <div className="cr2 click" onClick={() => say("Link shared (placeholder)")}><div className="rl"><Ic n="share" />Share link via Signal</div></div></div>
            <div className="card" style={{ marginTop: 16 }}><div className="cr2 click" style={{ color: "#e5483a" }} onClick={() => { saveLinks(links.filter(x => x.id !== l.id)); setSelCall(null); }}><div className="rl"><Ic n="trash" />Delete link</div></div></div></div></div>); })()}
        {tab === "stories" && <div className="empty" style={{ margin: "auto" }}><Ic n="stories" s={40} />Click + to add an update.</div>}

        {tab === "settings" && sec === "profile" && <div className="pane">{backBtn}<b>Profile</b><Av name={name} color="#2c6bed" size={110} /><button className="pill" onClick={() => say()}>Edit photo</button>
          <div className="card"><div className="cr"><Ic n="user" />{name}</div><div className="cr"><Ic n="edit" />About</div></div>
          <div className="hint">Your profile and changes to it will be visible to people you message, contacts and groups.</div>
          <div className="card"><div className="cr"><Ic n="at" />Username</div></div>
          <div className="hint">People can message you using your optional username so you don't have to give out your phone number.</div></div>}

        {tab === "settings" && sec !== "profile" && <>{backBtn}{renderSet()}</>}
      </main>

      {modal && <div className="ov" onClick={() => setModal(null)}><div className="md" onClick={e => e.stopPropagation()}>
        {modal === "new" ? <><div className="ph"><h1>New chat</h1><button className="ib" onClick={() => setModal(null)}>✕</button></div>
          <div className="sr"><div className="sb"><Ic n="search" s={16} /><input autoFocus placeholder="Search name or number" value={mq} onChange={e => setMq(e.target.value)} /></div></div>
          <div className="list" style={{ paddingBottom: 12 }}><button className="row" onClick={() => setModal("group")}><div className="av" style={{ width: 40, height: 40, background: "var(--sel)" }}><Ic n="users" /></div><b>New group</b></button>
            {people.map(p => <button key={p.id} className="row" onClick={() => startDirect(p)}><Av name={p.display_name} color={p.color} size={40} /><div className="meta"><b>{p.display_name}</b><div className="sub">{p.online ? "Online" : "Last seen " + ago(p.last_seen)}</div></div></button>)}</div></>
          : <><div className="ph"><h1>New group</h1><button className="ib" onClick={() => setModal("new")}>←</button></div>
            <div className="sr"><div className="sb"><input autoFocus placeholder="Group name" value={gname} onChange={e => setGname(e.target.value)} /></div></div>
            <div className="list">{people.map(p => <button key={p.id} className="row" onClick={() => setSel(s => s.includes(p.id) ? s.filter(x => x !== p.id) : [...s, p.id])}>
              <Av name={p.display_name} color={p.color} size={40} /><b style={{ flex: 1 }}>{p.display_name}</b><span>{sel.includes(p.id) ? "☑" : "☐"}</span></button>)}</div>
            <div style={{ padding: 16 }}><button className="btn" style={{ width: "100%" }} onClick={makeGroup}>Create</button></div></>}
      </div></div>}
      {callModal != null && (() => { const l = links.find(x => x.id === callModal); if (!l) return null;
        return <div className="ov" onClick={() => setCallModal(null)}><div className="md" style={{ padding: 20, gap: 10 }} onClick={e => e.stopPropagation()}>
          <b style={{ textAlign: "center" }}>Call link details</b>
          <div className="cr2" style={{ padding: "8px 0" }}><div className="av" style={{ width: 64, height: 64, background: "#fdf3cf", color: "#8a6d1a" }}><Ic n="video" s={30} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><b>{l.name || "Signal Call"}</b><div className="sub" style={{ wordBreak: "break-all" }}>https://{linkUrl(l)}</div></div><button className="join" onClick={() => say("Calls are a placeholder")}>Join</button></div>
          <hr style={{ margin: 0 }} />
          <div className="cr2 click" onClick={() => rename(l)}><div className="rl"><Ic n="edit" />Add call name</div></div>
          <div className="cr2"><div className="rl"><Ic n="usercheck" />Require admin approval</div><button className={"tg" + (l.approval ? " on" : "")} onClick={() => updLink(l.id, { approval: !l.approval })}><i /></button></div>
          <hr style={{ margin: 0 }} />
          <div className="cr2 click" onClick={() => copy(l)}><div className="rl"><Ic n="copy" />Copy link</div></div>
          <div className="cr2 click" onClick={() => say("Link shared (placeholder)")}><div className="rl"><Ic n="share" />Share link via Signal</div></div>
          <div style={{ textAlign: "right" }}><button className="btn" style={{ borderRadius: 20 }} onClick={() => { setCallModal(null); setSelCall(l.id); }}>Done</button></div></div></div>; })()}

      {storyModal && <div className="ov" onClick={() => setStoryModal(false)}><div className="md" style={{ padding: 20, gap: 10, width: 440 }} onClick={e => e.stopPropagation()}>
        <div className="cr2" style={{ padding: 0 }}><b>Story privacy</b><button className="ib" onClick={() => setStoryModal(false)}><Ic n="x" /></button></div>
        <div className="sub">Stories automatically disappear after 24 hours. Choose who can view your story or create new stories with specific viewers or groups.</div>
        <h2 className="bh" style={{ margin: "8px 0 0" }}>My Stories</h2>
        <div className="cr2 click" style={{ padding: "6px 0" }} onClick={() => say("Stories are a placeholder")}><div className="rl"><div className="av" style={{ width: 40, height: 40, background: "var(--sel)" }}><Ic n="plus" /></div>New Story</div></div>
        <div className="cr2" style={{ padding: "6px 0" }}><div className="rl"><Av name={name} color="#2c6bed" size={40} /><div><div>My Story</div><div className="sub">All Signal connections · {cu.length} viewers</div></div></div></div>
        <hr style={{ margin: "4px 0" }} />
        <label className="cr2" style={{ padding: "4px 0", justifyContent: "flex-start", alignItems: "flex-start" }}><input type="checkbox" checked={gv("vr", true)} onChange={e => setPref("vr", e.target.checked)} />
          <div><div>View Receipts</div><div className="sub">See and share when stories are viewed. If disabled, you won't see when others view your story.</div></div></label>
        <div className="cr2" style={{ padding: 0 }}><div className="sub" style={{ flex: 1 }}>If you opt out of stories you will no longer be able to share or view stories.</div>
          <button className="pill red" onClick={() => { setStoryModal(false); say("Stories turned off (placeholder)"); }}>Turn off stories</button></div></div></div>}

      {gs && isGroup && <div className="ov" onClick={() => setGs(false)}><div className="md" style={{ padding: 20, gap: 8 }} onClick={e => e.stopPropagation()}>
        <div className="cr2" style={{ padding: 0 }}><b>Group settings</b><button className="ib" onClick={() => setGs(false)}><Ic n="x" /></button></div>
        <div style={{ textAlign: "center" }}><Av name={active.name} group size={64} /><div style={{ fontWeight: 600, fontSize: 18, marginTop: 6 }}>{active.name}</div></div>
        <h2 className="bh" style={{ margin: "8px 0 0" }}>{mem.length} members</h2>
        <div style={{ overflow: "auto", maxHeight: 260 }}>{mem.map(m => <div key={m.id} className="cr2" style={{ padding: "6px 0" }}>
          <div className="rl"><Av name={m.display_name} color={m.color || "#2c6bed"} size={36} /><div><div>{m.id === auth.user.id ? "You" : m.display_name}</div>{m.role === "admin" && <div className="sub">Admin</div>}</div></div>
          {isAdmin && m.id !== auth.user.id && <div className="rr">{m.role !== "admin" && <button className="pill" onClick={() => promote(m.id)}>Make admin</button>}<button className="pill red" onClick={() => rmM(m.id)}>Remove</button></div>}</div>)}</div>
        {isAdmin && <><h2 className="bh" style={{ margin: "8px 0 0" }}>Add members</h2><div style={{ overflow: "auto", maxHeight: 140 }}>
          {cu.filter(u => !mem.some(m => m.id === u.id)).map(u => <div key={u.id} className="cr2" style={{ padding: "6px 0" }}><div className="rl"><Av name={u.display_name} color={u.color} size={36} />{u.display_name}</div><button className="pill" onClick={() => addM(u.id)}>Add</button></div>)}</div></>}
        {!isAdmin && <div className="sub">Only admins can add or remove members.</div>}
        <button className="pill red" style={{ marginTop: 8 }} onClick={leaveGroup}>Leave group</button></div></div>}

      {toast && <div className="toast">{toast}</div>}
    </div>);
}
