import { useState } from "react";
import { login, register } from "./api";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "register") {
        await register(username, email, password);
        setMode("login");
        return;
      }
      const { access_token } = await login(username, password);
      localStorage.setItem("token", access_token);
      onAuth(access_token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>CipherChat</h2>
        <p style={styles.sub}>End-to-end encrypted messaging</p>
        <div style={styles.tabs}>
          <button style={mode === "login" ? styles.activeTab : styles.tab} onClick={() => setMode("login")}>Login</button>
          <button style={mode === "register" ? styles.activeTab : styles.tab} onClick={() => setMode("register")}>Register</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          {mode === "register" && (
            <input style={styles.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          )}
          <input style={styles.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit">{mode === "login" ? "Sign In" : "Create Account"}</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#0f0f0f" },
  card: { background: "#1a1a1a", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "380px", border: "1px solid #2a2a2a" },
  title: { color: "#fff", margin: 0, fontSize: "1.5rem" },
  sub: { color: "#666", fontSize: "0.85rem", marginTop: "4px", marginBottom: "1.5rem" },
  tabs: { display: "flex", marginBottom: "1.2rem", gap: "8px" },
  tab: { flex: 1, padding: "8px", background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "6px", cursor: "pointer" },
  activeTab: { flex: 1, padding: "8px", background: "#7c3aed", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#fff", fontSize: "0.95rem" },
  button: { padding: "10px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.95rem" },
  error: { color: "#f87171", fontSize: "0.85rem", margin: 0 }
};
