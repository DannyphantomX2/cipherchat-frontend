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

      {/* Welcome banner */}
      <div style={styles.banner}>
        <div style={styles.bannerIcon}>🔒</div>
        <h1 style={styles.bannerTitle}>CipherChat</h1>
        <p style={styles.bannerTagline}>Private messaging that means it.</p>
        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🔑</span>
            <div>
              <div style={styles.featureTitle}>End-to-end encrypted</div>
              <div style={styles.featureDesc}>Messages are encrypted in your browser. The server never sees your plaintext.</div>
            </div>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>⚡</span>
            <div>
              <div style={styles.featureTitle}>Real-time</div>
              <div style={styles.featureDesc}>Messages delivered instantly via WebSocket — no polling, no delays.</div>
            </div>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🚪</span>
            <div>
              <div style={styles.featureTitle}>Invite-only rooms</div>
              <div style={styles.featureDesc}>Create a room and share a 12-character invite code with whoever you want to chat with.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth card */}
      <div style={styles.card}>
        <h2 style={styles.title}>CipherChat</h2>
        <p style={styles.sub}>End-to-end encrypted messaging</p>
        <div style={styles.tabs}>
          <button
            style={mode === "login" ? styles.activeTab : styles.tab}
            onClick={() => setMode("login")}>
            Login
          </button>
          <button
            style={mode === "register" ? styles.activeTab : styles.tab}
            onClick={() => setMode("register")}>
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          {mode === "register" && (
            <input
              style={styles.input}
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          )}
          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        {mode === "login" && (
          <p style={styles.hint}>Don't have an account? <span style={styles.link} onClick={() => setMode("register")}>Register here</span></p>
        )}
        {mode === "register" && (
          <p style={styles.hint}>Already have an account? <span style={styles.link} onClick={() => setMode("login")}>Sign in</span></p>
        )}
      </div>

    </div>
  );
}

const styles = {
  container:      { display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0f0f0f", gap: "48px", padding: "32px", flexWrap: "wrap" },
  banner:         { maxWidth: "420px", flex: "1 1 320px" },
  bannerIcon:     { fontSize: "2.5rem", marginBottom: "12px" },
  bannerTitle:    { color: "#fff", fontSize: "2.2rem", fontWeight: 700, margin: "0 0 8px 0", fontFamily: "Arial" },
  bannerTagline:  { color: "#888", fontSize: "1rem", margin: "0 0 32px 0", fontFamily: "Arial" },
  features:       { display: "flex", flexDirection: "column", gap: "20px" },
  feature:        { display: "flex", alignItems: "flex-start", gap: "14px" },
  featureIcon:    { fontSize: "1.4rem", marginTop: "2px" },
  featureTitle:   { color: "#fff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "4px", fontFamily: "Arial" },
  featureDesc:    { color: "#666", fontSize: "0.82rem", lineHeight: 1.5, fontFamily: "Arial" },
  card:           { background: "#1a1a1a", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "380px", border: "1px solid #2a2a2a", flex: "0 0 380px" },
  title:          { color: "#fff", margin: 0, fontSize: "1.5rem", fontFamily: "Arial" },
  sub:            { color: "#666", fontSize: "0.85rem", marginTop: "4px", marginBottom: "1.5rem", fontFamily: "Arial" },
  tabs:           { display: "flex", marginBottom: "1.2rem", gap: "8px" },
  tab:            { flex: 1, padding: "8px", background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "6px", cursor: "pointer", fontFamily: "Arial" },
  activeTab:      { flex: 1, padding: "8px", background: "#7c3aed", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer", fontFamily: "Arial" },
  form:           { display: "flex", flexDirection: "column", gap: "12px" },
  input:          { padding: "10px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#fff", fontSize: "0.95rem", fontFamily: "Arial" },
  button:         { padding: "10px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.95rem", fontFamily: "Arial" },
  error:          { color: "#f87171", fontSize: "0.85rem", margin: 0, fontFamily: "Arial" },
  hint:           { color: "#555", fontSize: "0.82rem", textAlign: "center", marginTop: "12px", fontFamily: "Arial" },
  link:           { color: "#7c3aed", cursor: "pointer" },
};
