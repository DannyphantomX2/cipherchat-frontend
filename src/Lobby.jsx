import { useState, useEffect } from "react";
import { getRooms, createRoom, joinRoom } from "./api";

export default function Lobby({ token, onSelectRoom, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [newName, setNewName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { getRooms(token).then(setRooms); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const room = await createRoom(token, newName.trim());
      setRooms(prev => [...prev, room]);
      setNewName("");
    } catch (err) { setError(err.message); }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError("");
    try {
      const room = await joinRoom(token, inviteCode.trim());
      setRooms(prev => prev.find(r => r.id === room.id) ? prev : [...prev, room]);
      setInviteCode("");
    } catch (err) { setError(err.message); }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>CipherChat</span>
        <button style={styles.logout} onClick={onLogout}>Logout</button>
      </div>
      <div style={styles.body}>
        <div style={styles.actions}>
          <form onSubmit={handleCreate} style={styles.row}>
            <input style={styles.input} placeholder="New room name" value={newName} onChange={e => setNewName(e.target.value)} required />
            <button style={styles.btn} type="submit">Create</button>
          </form>
          <form onSubmit={handleJoin} style={styles.row}>
            <input style={styles.input} placeholder="Invite code" value={inviteCode} onChange={e => setInviteCode(e.target.value)} required />
            <button style={styles.btn} type="submit">Join</button>
          </form>
          {error && <p style={styles.error}>{error}</p>}
        </div>
        <div style={styles.roomList}>
          {rooms.length === 0 && <p style={styles.empty}>No rooms yet. Create or join one above.</p>}
          {rooms.map(room => (
            <div key={room.id} style={styles.roomCard} onClick={() => onSelectRoom(room)}>
              <span style={styles.roomName}>{room.name}</span>
              <span style={styles.roomCode}>{room.invite_code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", height: "100vh", background: "#0f0f0f" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#1a1a1a", borderBottom: "1px solid #2a2a2a" },
  title: { color: "#fff", fontWeight: 700, fontSize: "1.1rem" },
  logout: { background: "none", border: "1px solid #333", color: "#aaa", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" },
  body: { flex: 1, overflowY: "auto", padding: "20px" },
  actions: { marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px" },
  row: { display: "flex", gap: "8px" },
  input: { flex: 1, padding: "9px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#fff", fontSize: "0.9rem" },
  btn: { padding: "9px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  error: { color: "#f87171", fontSize: "0.85rem", margin: 0 },
  roomList: { display: "flex", flexDirection: "column", gap: "8px" },
  empty: { color: "#555", fontSize: "0.9rem" },
  roomCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", cursor: "pointer" },
  roomName: { color: "#fff", fontWeight: 500 },
  roomCode: { color: "#666", fontSize: "0.8rem" }
};
