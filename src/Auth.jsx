import { useState, useEffect, useRef } from "react";
import { login, register } from "./api";

function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF";
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = i % 3 === 0 ? "#00ff9d44" : "#00ff9d18";
        ctx.font = "14px monospace";
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
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, opacity: 0.6 }} />;
}

function AnimatedPadlock() {
  return (
    <div style={lockStyles.wrapper}>
      <div style={lockStyles.ring1} />
      <div style={lockStyles.ring2} />
      <div style={lockStyles.ring3} />
      <div style={lockStyles.glowOrb} />
      <div style={lockStyles.beam} />
      <div style={lockStyles.lockContainer}>
        <svg width="90" height="110" viewBox="0 0 90 110" fill="none">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path d="M20 45V30C20 13.4 33.4 0 50 0C66.6 0 80 13.4 80 30V45" stroke="#00ff9d" strokeWidth="8" strokeLinecap="round" fill="none" filter="url(#glow)" />
          <rect x="5" y="42" width="80" height="68" rx="12" fill="#0a1628" stroke="#00ff9d" strokeWidth="2" filter="url(#glow)" />
          <circle cx="50" cy="72" r="12" fill="#00ff9d22" stroke="#00ff9d" strokeWidth="2" filter="url(#glow)" />
          <rect x="46" y="78" width="8" height="16" rx="4" fill="#00ff9d" filter="url(#glow)" />
          <line x1="5" y1="60" x2="0" y2="60" stroke="#00ff9d44" strokeWidth="1" />
          <line x1="85" y1="60" x2="90" y2="60" stroke="#00ff9d44" strokeWidth="1" />
        </svg>
      </div>
      <div style={lockStyles.pulse1} />
      <div style={lockStyles.pulse2} />
    </div>
  );
}

const lockStyles = {
  wrapper: { position: "relative", width: "340px", height: "440px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  ring1: { position: "absolute", width: "280px", height: "280px", borderRadius: "50%", border: "1px solid #00ff9d33", animation: "spin 8s linear infinite" },
  ring2: { position: "absolute", width: "220px", height: "220px", borderRadius: "50%", border: "1px solid #00ff9d55", animation: "spin 5s linear infinite reverse" },
  ring3: { position: "absolute", width: "160px", height: "160px", borderRadius: "50%", border: "2px solid #00ff9d33", animation: "spin 12s linear infinite" },
  glowOrb: { position: "absolute", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, #00ff9d18 0%, transparent 70%)", animation: "pulse 3s ease-in-out infinite" },
  beam: { position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "180px", background: "linear-gradient(to bottom, #00ff9d88, transparent)", filter: "blur(4px)", animation: "pulse 3s ease-in-out infinite" },
  lockContainer: { position: "relative", zIndex: 2, filter: "drop-shadow(0 0 20px #00ff9d88)", animation: "float 4s ease-in-out infinite" },
  pulse1: { position: "absolute", width: "320px", height: "320px", borderRadius: "50%", border: "1px solid #00ff9d22", animation: "pulseRing 3s ease-out infinite" },
  pulse2: { position: "absolute", width: "320px", height: "320px", borderRadius: "50%", border: "1px solid #00ff9d11", animation: "pulseRing 3s ease-out infinite 1.5s" },
};

function RegisterForm({ onSwitch, onAuth }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    try {
      await register(username, email, password);
      const { access_token } = await login(username, password);
      localStorage.setItem("token", access_token);
      localStorage.setItem("username", username);
      onAuth(access_token);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyles.form}>
      <div style={cardStyles.iconWrap}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="#00ff9d" strokeWidth="1.5" />
          <path d="M14 26V20C14 14.5 18.5 10 24 10C29.5 10 34 14.5 34 20V26" stroke="#00ff9d" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <rect x="10" y="24" width="28" height="22" rx="6" fill="#0a1628" stroke="#00ff9d" strokeWidth="1.5"/>
          <circle cx="24" cy="34" r="4" stroke="#00ff9d" strokeWidth="1.5"/>
          <rect x="22" y="36" width="4" height="6" rx="2" fill="#00ff9d"/>
        </svg>
      </div>
      <h2 style={cardStyles.title}>Create Account</h2>
      <p style={cardStyles.sub}>Join CipherChat and experience private messaging redefined.</p>
      <div style={cardStyles.field}>
        <span style={cardStyles.fieldIcon}>👤</span>
        <input style={cardStyles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div style={cardStyles.field}>
        <span style={cardStyles.fieldIcon}>✉</span>
        <input style={cardStyles.input} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div style={cardStyles.field}>
        <span style={cardStyles.fieldIcon}>🔒</span>
        <input style={cardStyles.input} type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="button" style={cardStyles.eyeBtn} onClick={() => setShowPw(!showPw)}>{showPw ? "🙈" : "👁"}</button>
      </div>
      <div style={cardStyles.field}>
        <span style={cardStyles.fieldIcon}>🔒</span>
        <input style={cardStyles.input} type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </div>
      <p style={cardStyles.terms}>I agree to the <span style={cardStyles.link}>Terms of Service</span> and <span style={cardStyles.link}>Privacy Policy</span></p>
      {error && <p style={cardStyles.error}>{error}</p>}
      <button style={{ ...cardStyles.signInBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
        {loading ? "Creating..." : "Sign Up"} <span style={{ marginLeft: 8 }}>→</span>
      </button>
      <p style={cardStyles.switchText}>Already have an account? <span style={cardStyles.link} onClick={onSwitch}>Sign In</span></p>
    </form>
  );
}
export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { access_token } = await login(username, password);
      localStorage.setItem("token", access_token);
      localStorage.setItem("username", username);
      onAuth(access_token);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div style={styles.root}>
      <style>{css}</style>
      <MatrixRain />
      <div style={styles.worldMap} />
      <div style={styles.content}>
        <div style={styles.left}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="21" stroke="#00ff9d" strokeWidth="1.5"/>
                <circle cx="22" cy="22" r="14" stroke="#00ff9d44" strokeWidth="1"/>
                <path d="M12 24V18C12 11.4 16.5 7 22 7C27.5 7 32 11.4 32 18V24" stroke="#00ff9d" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <rect x="8" y="22" width="28" height="20" rx="6" fill="#0a1628" stroke="#00ff9d" strokeWidth="1.5"/>
                <circle cx="22" cy="30" r="4" stroke="#00ff9d" strokeWidth="1.5"/>
                <rect x="20" y="32" width="4" height="6" rx="2" fill="#00ff9d"/>
              </svg>
            </div>
            <div>
              <span style={styles.logoText}>CIPHER</span>
              <span style={styles.logoCyan}>CHAT</span>
            </div>
          </div>
          <div style={styles.headline}>
            <h1 style={styles.h1}>Your Conversations.</h1>
            <h1 style={styles.h1Cyan}>Encrypted. Always.</h1>
          </div>
          <p style={styles.tagline}>End-to-end encrypted messaging<br />that puts privacy back in your hands.</p>
          <div style={styles.features}>
            {[
              { icon: "🛡", title: "End-to-End\nEncryption", desc: "Only you and your recipient can read the messages." },
              { icon: "🔮", title: "Zero-Knowledge\nArchitecture", desc: "We don't store your messages. Ever." },
              { icon: "🔐", title: "Private by\nDesign", desc: "Built from the ground up for your privacy." },
            ].map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <div style={styles.featureTitle}>{f.title}</div>
                <div style={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div style={styles.quote}>
            <span style={styles.quoteMark}>"</span>
            <div>
              <p style={styles.quoteText}>Privacy is not an option,<br />and it shouldn't be the price we accept<br />for just getting on the internet.</p>
              <p style={styles.quoteAuthor}>— Gary Kovacs</p>
            </div>
          </div>
          <div style={styles.stats}>
            {[
              { icon: "👥", val: "1M+", label: "Active Users" },
              { icon: "💬", val: "50M+", label: "Messages Secured" },
              { icon: "🛡", val: "99.99%", label: "Uptime" },
              { icon: "🌍", val: "180+", label: "Countries" },
            ].map((s, i) => (
              <div key={i} style={styles.stat}>
                <span style={styles.statIcon}>{s.icon}</span>
                <span style={styles.statVal}>{s.val}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.center}><AnimatedPadlock /></div>

        <div style={styles.right}>
          <div style={styles.card}>
            {mode === "register" ? (
              <RegisterForm onSwitch={() => setMode("login")} onAuth={onAuth} />
            ) : (
              <form onSubmit={handleLogin} style={cardStyles.form}>
                <div style={cardStyles.iconWrap}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="23" stroke="#00ff9d" strokeWidth="1.5" />
                    <path d="M14 26V20C14 14.5 18.5 10 24 10C29.5 10 34 14.5 34 20V26" stroke="#00ff9d" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <rect x="10" y="24" width="28" height="22" rx="6" fill="#0a1628" stroke="#00ff9d" strokeWidth="1.5"/>
                    <circle cx="24" cy="34" r="4" stroke="#00ff9d" strokeWidth="1.5"/>
                    <rect x="22" y="36" width="4" height="6" rx="2" fill="#00ff9d"/>
                  </svg>
                </div>
                <h2 style={cardStyles.title}>Welcome Back</h2>
                <p style={cardStyles.sub}>Sign in to continue your encrypted conversations.</p>
                <div style={cardStyles.field}>
                  <span style={cardStyles.fieldIcon}>✉</span>
                  <input style={cardStyles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div style={cardStyles.field}>
                  <span style={cardStyles.fieldIcon}>🔒</span>
                  <input style={cardStyles.input} type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" style={cardStyles.eyeBtn} onClick={() => setShowPw(!showPw)}>{showPw ? "🙈" : "👁"}</button>
                </div>
                <div style={{ textAlign: "right", marginBottom: "4px" }}>
                  <span style={cardStyles.link}>Forgot password?</span>
                </div>
                {error && <p style={cardStyles.error}>{error}</p>}
                <button style={{ ...cardStyles.signInBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"} <span style={{ marginLeft: 8 }}>→</span>
                </button>
                <div style={cardStyles.orRow}>
                  <div style={cardStyles.orLine} /><span style={cardStyles.orText}>or</span><div style={cardStyles.orLine} />
                </div>
                <button type="button" style={cardStyles.createBtn} onClick={() => setMode("register")}>
                  Create an Account
                </button>
                <p style={cardStyles.termsBottom}>
                  By continuing, you agree to our <span style={cardStyles.link}>Terms of Service</span><br />and <span style={cardStyles.link}>Privacy Policy</span>.
                </p>
              </form>
            )}
          </div>
          <p style={styles.credit}>Built by Ndabai Daniel</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#050d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani', 'Orbitron', sans-serif", overflow: "hidden", position: "relative" },
  worldMap: { position: "fixed", inset: 0, zIndex: 0, backgroundImage: "radial-gradient(ellipse at 40% 50%, #00ff9d08 0%, transparent 60%), radial-gradient(ellipse at 60% 50%, #0066ff08 0%, transparent 60%)", pointerEvents: "none" },
  content: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0px", padding: "24px 16px", width: "100%", maxWidth: "1400px", flexWrap: "wrap" },
  left: { flex: "1 1 340px", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "20px", padding: "20px" },
  center: { flex: "0 0 340px", display: "flex", alignItems: "center", justifyContent: "center" },
  right: { flex: "1 1 340px", maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px" },
  logo: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: { filter: "drop-shadow(0 0 8px #00ff9d88)" },
  logoText: { fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "3px", fontFamily: "'Orbitron', sans-serif" },
  logoCyan: { fontSize: "28px", fontWeight: 700, color: "#00ff9d", letterSpacing: "3px", marginLeft: "6px", fontFamily: "'Orbitron', sans-serif" },
  headline: { display: "flex", flexDirection: "column", gap: "4px" },
  h1: { fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 },
  h1Cyan: { fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 700, color: "#00ff9d", margin: 0, lineHeight: 1.2, filter: "drop-shadow(0 0 8px #00ff9d66)" },
  tagline: { color: "#8899aa", fontSize: "14px", lineHeight: 1.6, margin: 0 },
  features: { display: "flex", gap: "12px" },
  featureCard: { flex: 1, background: "#0a1628cc", border: "1px solid #00ff9d22", borderRadius: "10px", padding: "14px 10px", display: "flex", flexDirection: "column", gap: "6px", backdropFilter: "blur(8px)" },
  featureIcon: { fontSize: "22px", filter: "drop-shadow(0 0 4px #00ff9d)" },
  featureTitle: { fontSize: "11px", fontWeight: 700, color: "#fff", whiteSpace: "pre-line", lineHeight: 1.3 },
  featureDesc: { fontSize: "10px", color: "#8899aa", lineHeight: 1.4 },
  quote: { background: "#0a162888", border: "1px solid #00ff9d22", borderRadius: "10px", padding: "14px 16px", display: "flex", gap: "10px", alignItems: "flex-start" },
  quoteMark: { fontSize: "36px", color: "#00ff9d", lineHeight: 1, fontFamily: "Georgia, serif", flexShrink: 0 },
  quoteText: { fontSize: "12px", color: "#aabbcc", lineHeight: 1.6, margin: "0 0 6px 0", fontStyle: "italic" },
  quoteAuthor: { fontSize: "11px", color: "#00ff9d", margin: 0, fontWeight: 600 },
  stats: { background: "#0a1628cc", border: "1px solid #00ff9d22", borderRadius: "10px", padding: "14px", display: "flex", justifyContent: "space-between" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" },
  statIcon: { fontSize: "16px" },
  statVal: { fontSize: "16px", fontWeight: 700, color: "#fff" },
  statLabel: { fontSize: "9px", color: "#8899aa", textAlign: "center" },
  card: { width: "100%", maxWidth: "400px", background: "linear-gradient(135deg, #0d1f3c 0%, #0a1628 100%)", border: "1px solid #00ff9d33", borderRadius: "16px", overflow: "hidden", boxShadow: "0 0 40px #00ff9d18, 0 0 80px #0066ff0a", backdropFilter: "blur(20px)" },
  credit: { color: "#334455", fontSize: "11px", marginTop: "4px" },
};

const cardStyles = {
  form: { padding: "32px 28px", display: "flex", flexDirection: "column", gap: "14px" },
  iconWrap: { display: "flex", justifyContent: "center", marginBottom: "4px", filter: "drop-shadow(0 0 12px #00ff9d88)" },
  title: { color: "#fff", fontSize: "22px", fontWeight: 700, textAlign: "center", margin: 0, fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" },
  sub: { color: "#8899aa", fontSize: "12px", textAlign: "center", lineHeight: 1.5, margin: 0 },
  field: { display: "flex", alignItems: "center", gap: "10px", background: "#0a1628", border: "1px solid #00ff9d33", borderRadius: "8px", padding: "12px 14px" },
  fieldIcon: { fontSize: "14px", flexShrink: 0, opacity: 0.7 },
  input: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", fontFamily: "'Rajdhani', sans-serif" },
  eyeBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: 0.6, padding: 0 },
  link: { color: "#00ff9d", cursor: "pointer", fontSize: "12px" },
  terms: { fontSize: "11px", color: "#8899aa", margin: 0 },
  termsBottom: { fontSize: "11px", color: "#8899aa", textAlign: "center", margin: 0, lineHeight: 1.6 },
  error: { color: "#ff4466", fontSize: "12px", margin: 0, textAlign: "center" },
  signInBtn: { width: "100%", padding: "14px", background: "linear-gradient(90deg, #00cc7a, #00ff9d)", border: "none", borderRadius: "8px", color: "#050d1a", fontSize: "16px", fontWeight: 700, cursor: "pointer", letterSpacing: "1px", fontFamily: "'Orbitron', sans-serif", boxShadow: "0 0 20px #00ff9d44", display: "flex", alignItems: "center", justifyContent: "center" },
  orRow: { display: "flex", alignItems: "center", gap: "12px" },
  orLine: { flex: 1, height: "1px", background: "#1a2a3a" },
  orText: { color: "#556677", fontSize: "12px" },
  createBtn: { width: "100%", padding: "13px", background: "transparent", border: "1px solid #00ff9d44", borderRadius: "8px", color: "#00ff9d", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "1px" },
  switchText: { fontSize: "12px", color: "#8899aa", textAlign: "center", margin: 0 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap');
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-16px); } }
  @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
  @keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
  @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
  input::placeholder { color: #556677; }
  input:focus { outline: none; }
  * { box-sizing: border-box; }
`;
