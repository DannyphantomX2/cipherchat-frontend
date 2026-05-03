import { useState, useEffect, useRef } from "react";
import { getRooms, createRoom, joinRoom } from "./api";

function MatrixBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);
    const chars = "アイウエオカキクケコ0123456789ABCDEF";
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = i % 3 === 0 ? "#00ff9d22" : "#00ff9d0f";
        ctx.font = "13px monospace";
        ctx.fillText(char, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const interval = setInterval(draw, 50);
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { clearInterval(interval); window.removeEventListener("resize", handleResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, opacity: 0.4 }} />;
}

function Avatar({ name, size = 46 }) {
  const colors = ["#00cc7a", "#0088ff", "#aa44ff", "#ff6644", "#ffaa00"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}33, ${color}88)`,
      border: `1.5px solid ${color}66`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color,
      flexShrink: 0, fontFamily: "Orbitron, sans-serif",
      boxShadow: `0 0 12px ${color}33`
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default function Lobby({ token, onSelectRoom, onLogout, username }) {
  const [rooms, setRooms] = useState([]);
  const [newName, setNewName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { getRooms(token).then(setRooms); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const room = await createRoom(token, newName.trim());
      setRooms(prev => [...prev, room]);
      setNewName("");
      setShowNew(false);
    } catch (err) { setError(err.message); }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError("");
    try {
      const room = await joinRoom(token, inviteCode.trim());
      setRooms(prev => prev.find(r => r.id === room.id) ? prev : [...prev, room]);
      setInviteCode("");
      setShowJoin(false);
    } catch (err) { setError(err.message); }
  }

  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={s.root}>
      <style>{css}</style>
      <MatrixBg />
      <div style={s.shell}>
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.logoWrap}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#00ff9d" strokeWidth="1.2"/>
                <circle cx="16" cy="16" r="10" stroke="#00ff9d44" strokeWidth="1"/>
                <path d="M10 17V13a6 6 0 0 1 12 0v4" stroke="#00ff9d" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <rect x="8" y="15" width="16" height="12" rx="4" fill="#050d1a" stroke="#00ff9d" strokeWidth="1.4"/>
                <circle cx="16" cy="21" r="2.2" stroke="#00ff9d" strokeWidth="1.4"/>
                <rect x="15" y="22.5" width="2" height="3" rx="1" fill="#00ff9d"/>
              </svg>
            </div>
            <div>
              <div style={s.logoText}>CIPHER<span style={s.logoChat}>CHAT</span></div>
              <div style={s.onlineDot}><span style={s.dot}/> Encrypted</div>
            </div>
          </div>
          <div style={s.headerRight}>
            <Avatar name={username || "U"} size={36} />
            <button style={s.menuBtn} onClick={onLogout} title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8899aa" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>

        <div style={s.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#556677" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input style={s.searchInput} placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={s.filterBtn} onClick={() => setShowJoin(!showJoin)} title="Join room">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        {(showNew || showJoin) && (
          <div style={s.actionPanel}>
            {showNew && (
              <form onSubmit={handleCreate} style={s.actionForm}>
                <input style={s.actionInput} placeholder="Room name..." value={newName} onChange={e => setNewName(e.target.value)} autoFocus required />
                <button style={s.actionSubmit} type="submit">Create</button>
                <button style={s.actionCancel} type="button" onClick={() => setShowNew(false)}>✕</button>
              </form>
            )}
            {showJoin && (
              <form onSubmit={handleJoin} style={s.actionForm}>
                <input style={s.actionInput} placeholder="Invite code..." value={inviteCode} onChange={e => setInviteCode(e.target.value)} autoFocus required />
                <button style={s.actionSubmit} type="submit">Join</button>
                <button style={s.actionCancel} type="button" onClick={() => setShowJoin(false)}>✕</button>
              </form>
            )}
            {error && <p style={s.error}>{error}</p>}
          </div>
        )}

        <div style={s.tabBar}>
          <button style={{ ...s.tab, ...s.tabActive }}>Chats</button>
          <button style={s.tab} onClick={() => setShowNew(true)}>+ New Room</button>
        </div>

        <div style={s.list}>
          {filtered.length === 0 && (
            <div style={s.empty}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334455" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p style={{ color: "#334455", marginTop: 12, fontSize: 13 }}>No rooms yet</p>
            </div>
          )}
          {filtered.map((room, i) => (
            <div key={room.id} style={s.row} onClick={() => onSelectRoom(room)}
              onMouseEnter={e => e.currentTarget.style.background = "#0d1f3c"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Avatar name={room.name} />
              <div style={s.rowBody}>
                <div style={s.rowTop}>
                  <span style={s.rowName}>{room.name}</span>
                  <span style={s.rowTime}>{room.created_at ? new Date(room.created_at).toLocaleDateString() : ""}</span>
                </div>
                <div style={s.rowBottom}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ff9d88" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span style={s.rowSub}>End-to-end encrypted · {room.invite_code}</span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334455" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#050d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Rajdhani, Arial, sans-serif", position: "relative" },
  shell: { position: "relative", zIndex: 1, width: "100%", minHeight: "100vh", background: "linear-gradient(180deg, #0a1628 0%, #050d1a 100%)", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #0d2a1f", background: "#0a1628" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  logoWrap: { filter: "drop-shadow(0 0 8px #00ff9d88)" },
  logoText: { fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "Orbitron, sans-serif", letterSpacing: 2 },
  logoChat: { color: "#00ff9d", marginLeft: 2 },
  onlineDot: { display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#00ff9d", marginTop: 2 },
  dot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#00ff9d", boxShadow: "0 0 6px #00ff9d" },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  menuBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 6 },
  searchWrap: { display: "flex", alignItems: "center", gap: 10, margin: "12px 16px", background: "#0d1f3c", border: "1px solid #00ff9d1a", borderRadius: 10, padding: "10px 14px" },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "Rajdhani, sans-serif" },
  filterBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 2 },
  actionPanel: { margin: "0 16px 8px", background: "#0d1f3c", border: "1px solid #00ff9d22", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 },
  actionForm: { display: "flex", gap: 8, alignItems: "center" },
  actionInput: { flex: 1, background: "#050d1a", border: "1px solid #00ff9d33", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Rajdhani, sans-serif" },
  actionSubmit: { padding: "8px 16px", background: "linear-gradient(90deg, #00cc7a, #00ff9d)", border: "none", borderRadius: 8, color: "#050d1a", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "Orbitron, sans-serif" },
  actionCancel: { background: "none", border: "none", color: "#556677", cursor: "pointer", fontSize: 16, padding: "4px 6px" },
  error: { color: "#ff4466", fontSize: 12, margin: 0 },
  tabBar: { display: "flex", borderBottom: "1px solid #0d2a1f", margin: "0 0 4px" },
  tab: { flex: 1, padding: "12px 0", background: "none", border: "none", color: "#556677", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Rajdhani, sans-serif", letterSpacing: 1 },
  tabActive: { color: "#00ff9d", borderBottom: "2px solid #00ff9d" },
  list: { flex: 1, overflowY: "auto" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" },
  row: { display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", cursor: "pointer", borderBottom: "1px solid #0a1628", transition: "background 0.15s" },
  rowBody: { flex: 1, minWidth: 0 },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  rowName: { fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "Rajdhani, sans-serif" },
  rowTime: { fontSize: 11, color: "#445566", flexShrink: 0 },
  rowBottom: { display: "flex", alignItems: "center", gap: 5 },
  rowSub: { fontSize: 12, color: "#445566", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  input::placeholder { color: #334455; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #00ff9d33; border-radius: 2px; }
`;
