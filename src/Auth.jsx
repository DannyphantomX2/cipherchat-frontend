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
        ctx.fillStyle = i % 3 === 0 ? "#00ff9d33" : "#00ff9d14";
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
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, opacity: 0.5 }} />;
}

function WorldMap() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Cpath fill='none' stroke='%2300ff9d' stroke-width='0.4' opacity='0.12' d='M150 200 Q200 180 250 200 Q300 220 350 200 Q400 180 420 200 M100 250 Q150 230 200 250 Q260 270 300 250 Q350 230 400 250 Q450 270 500 250 Q550 230 600 250 Q650 270 700 250 Q750 230 800 250 M80 300 Q130 280 180 300 Q240 320 290 300 Q350 280 400 300 Q460 320 510 300 Q570 280 620 300 Q680 320 730 300 Q790 280 840 300 Q880 320 920 300 M100 350 Q160 330 210 350 Q270 370 320 350 Q380 330 430 350 Q490 370 540 350 Q600 330 650 350 Q710 370 760 350 Q820 330 870 350 M200 400 Q260 380 310 400 Q370 420 420 400 Q480 380 530 400 Q590 420 640 400 Q700 380 750 400'/%3E%3C/svg%3E")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }} />
  );
}

function GlowPadlock() {
  return (
    <div style={padStyles.outer}>
      <div style={padStyles.mapOverlay} />
      <div style={padStyles.teardrop}>
        <div style={padStyles.innerRing1} />
        <div style={padStyles.innerRing2} />
        <div style={padStyles.innerRing3} />
        <div style={padStyles.groundRing1} />
        <div style={padStyles.groundRing2} />
        <div style={padStyles.centerGlow} />
        <div style={padStyles.lockWrap}>
          <svg width="140" height="170" viewBox="0 0 140 170" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="lockglow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="strongglow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="8" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d2a1f"/>
                <stop offset="100%" stopColor="#051510"/>
              </linearGradient>
            </defs>
            <path d="M38 80V50C38 24 52 10 70 10C88 10 102 24 102 50V80"
              stroke="#00ff9d" strokeWidth="14" strokeLinecap="round" fill="none"
              filter="url(#lockglow)" />
            <path d="M46 80V50C46 28 57 18 70 18C83 18 94 28 94 50V80"
              stroke="#00ff9d44" strokeWidth="4" strokeLinecap="round" fill="none" />
            <rect x="12" y="76" width="116" height="94" rx="16"
              fill="url(#bodyGrad)" stroke="#00ff9d" strokeWidth="2.5"
              filter="url(#lockglow)" />
            <rect x="20" y="84" width="100" height="78" rx="12"
              fill="#00ff9d08" stroke="#00ff9d33" strokeWidth="1" />
            <circle cx="70" cy="116" r="18"
              fill="#00ff9d15" stroke="#00ff9d" strokeWidth="2.5"
              filter="url(#lockglow)" />
            <rect x="64" y="124" width="12" height="22" rx="6"
              fill="#00ff9d" filter="url(#strongglow)" />
            <line x1="12" y1="96" x2="0" y2="96" stroke="#00ff9d44" strokeWidth="1.5"/>
            <line x1="0" y1="96" x2="0" y2="106" stroke="#00ff9d44" strokeWidth="1.5"/>
            <line x1="128" y1="96" x2="140" y2="96" stroke="#00ff9d44" strokeWidth="1.5"/>
            <line x1="140" y1="96" x2="140" y2="106" stroke="#00ff9d44" strokeWidth="1.5"/>
            <line x1="12" y1="156" x2="0" y2="156" stroke="#00ff9d44" strokeWidth="1.5"/>
            <line x1="0" y1="156" x2="0" y2="146" stroke="#00ff9d44" strokeWidth="1.5"/>
            <line x1="128" y1="156" x2="140" y2="156" stroke="#00ff9d44" strokeWidth="1.5"/>
            <line x1="140" y1="156" x2="140" y2="146" stroke="#00ff9d44" strokeWidth="1.5"/>
            <line x1="20" y1="123" x2="120" y2="123" stroke="#00ff9d22" strokeWidth="1"/>
          </svg>
        </div>
        <div style={padStyles.beam} />
      </div>
    </div>
  );
}

const padStyles = {
  outer: { position: "relative", width: "500px", height: "580px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  mapOverlay: { position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 40%, #00ff9d06 0%, transparent 70%)", pointerEvents: "none" },
  teardrop: { position: "relative", width: "340px", height: "460px", borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", background: "radial-gradient(ellipse at 50% 40%, #00ff9d18 0%, #00ff9d08 40%, transparent 70%)", border: "1px solid #00ff9d44", boxShadow: "0 0 60px #00ff9d22, inset 0 0 40px #00ff9d0a", display: "flex", alignItems: "center", justifyContent: "center", animation: "float 4s ease-in-out infinite" },
  innerRing1: { position: "absolute", width: "280px", height: "380px", borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", border: "1px solid #00ff9d33", animation: "pulseOpacity 3s ease-in-out infinite" },
  innerRing2: { position: "absolute", width: "220px", height: "300px", borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", border: "1px solid #00ff9d55", animation: "pulseOpacity 3s ease-in-out infinite 0.5s" },
  innerRing3: { position: "absolute", width: "160px", height: "220px", borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", border: "1px solid #00ff9d33", animation: "pulseOpacity 3s ease-in-out infinite 1s" },
  groundRing1: { position: "absolute", bottom: "30px", width: "280px", height: "50px", borderRadius: "50%", border: "1px solid #00ff9d55", boxShadow: "0 0 20px #00ff9d33" },
  groundRing2: { position: "absolute", bottom: "20px", width: "200px", height: "34px", borderRadius: "50%", border: "1px solid #00ff9d44", boxShadow: "0 0 12px #00ff9d44" },
  centerGlow: { position: "absolute", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, #00ff9d22 0%, transparent 70%)", top: "30%", left: "50%", transform: "translateX(-50%)" },
  lockWrap: { position: "relative", zIndex: 2, marginBottom: "40px", filter: "drop-shadow(0 0 24px #00ff9daa) drop-shadow(0 0 8px #00ff9d)" },
  beam: { position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", width: "6px", height: "200px", background: "linear-gradient(to bottom, #00ff9daa, #00ff9d44, transparent)", filter: "blur(6px)", borderRadius: "3px" },
};

function LogoIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="27" stroke="#00ff9d" strokeWidth="1.5"/>
      <circle cx="28" cy="28" r="20" stroke="#00ff9d33" strokeWidth="1"/>
      <circle cx="28" cy="28" r="13" stroke="#00ff9d22" strokeWidth="1"/>
      <path d="M18 30V24C18 17 22.5 13 28 13C33.5 13 38 17 38 24V30"
        stroke="#00ff9d" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <rect x="14" y="28" width="28" height="20" rx="6" fill="#0a1628" stroke="#00ff9d" strokeWidth="1.5"/>
      <circle cx="28" cy="36" r="4" stroke="#00ff9d" strokeWidth="1.5"/>
      <rect x="26" y="38" width="4" height="6" rx="2" fill="#00ff9d"/>
      <line x1="14" y1="34" x2="8" y2="34" stroke="#00ff9d44" strokeWidth="1"/>
      <line x1="42" y1="34" x2="48" y2="34" stroke="#00ff9d44" strokeWidth="1"/>
    </svg>
  );
}

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
      <div style={cardStyles.logoWrap}><LogoIcon /></div>
      <h2 style={cardStyles.title}>Create Account</h2>
      <p style={cardStyles.sub}>Join CipherChat and experience private messaging redefined.</p>
      <div style={cardStyles.field}>
        <span style={cardStyles.fieldIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d99" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </span>
        <input style={cardStyles.input} placeholder="Full name" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div style={cardStyles.field}>
        <span style={cardStyles.fieldIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d99" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </span>
        <input style={cardStyles.input} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div style={cardStyles.field}>
        <span style={cardStyles.fieldIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d99" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        <input style={cardStyles.input} type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="button" style={cardStyles.eyeBtn} onClick={() => setShowPw(!showPw)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d66" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <div style={cardStyles.field}>
        <span style={cardStyles.fieldIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d99" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
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
      <WorldMap />
      <div style={styles.content}>

        <div style={styles.left}>
          <div style={styles.logo}>
            <div style={styles.logoIconWrap}><LogoIcon /></div>
            <div style={styles.logoTextWrap}>
              <div style={styles.logoLine1}>CIPHER</div>
              <div style={styles.logoLine2}>CHAT</div>
            </div>
          </div>

          <div style={styles.headlineWrap}>
            <h1 style={styles.h1white}>Your Conversations.</h1>
            <h1 style={styles.h1cyan}>Encrypted. Always.</h1>
          </div>

          <p style={styles.tagline}>End-to-end encrypted messaging<br />that puts privacy back in your hands.</p>

          <div style={styles.features}>
            {[
              { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="12" width="20" height="14" rx="4" stroke="#00ff9d" strokeWidth="1.5" fill="none"/><path d="M8 12V9a6 6 0 0 1 12 0v3" stroke="#00ff9d" strokeWidth="1.5" strokeLinecap="round" fill="none"/><circle cx="14" cy="18" r="2" stroke="#00ff9d" strokeWidth="1.5"/><line x1="14" y1="20" x2="14" y2="23" stroke="#00ff9d" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: "End-to-End\nEncryption", desc: "Only you and your recipient can read the messages." },
              { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="10" width="14" height="14" rx="3" stroke="#00ff9d" strokeWidth="1.5" fill="none"/><circle cx="11" cy="17" r="2" stroke="#00ff9d" strokeWidth="1.5"/><path d="M18 8h3a3 3 0 0 1 3 3v3" stroke="#00ff9d" strokeWidth="1.5" strokeLinecap="round"/><line x1="18" y1="17" x2="24" y2="17" stroke="#00ff9d" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: "Zero-Knowledge\nArchitecture", desc: "We don't store your messages. Ever." },
              { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="5" y="10" width="18" height="14" rx="4" stroke="#00ff9d" strokeWidth="1.5" fill="none"/><path d="M9 10V8a5 5 0 0 1 10 0v2" stroke="#00ff9d" strokeWidth="1.5" strokeLinecap="round" fill="none"/><circle cx="14" cy="17" r="2.5" stroke="#00ff9d" strokeWidth="1.5"/></svg>, title: "Private by\nDesign", desc: "Built from the ground up for your privacy." },
            ].map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIconWrap}>{f.icon}</div>
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

          <div style={styles.statsCard}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, val: "1M+", label: "Active Users" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, val: "50M+", label: "Messages Secured" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, val: "99.99%", label: "Uptime" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, val: "180+", label: "Countries" },
            ].map((s, i) => (
              <div key={i} style={styles.stat}>
                <span style={styles.statIcon}>{s.icon}</span>
                <span style={styles.statVal}>{s.val}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.center}><GlowPadlock /></div>

        <div style={styles.right}>
          <div style={styles.card}>
            {mode === "register" ? (
              <RegisterForm onSwitch={() => setMode("login")} onAuth={onAuth} />
            ) : (
              <form onSubmit={handleLogin} style={cardStyles.form}>
                <div style={cardStyles.logoWrap}><LogoIcon /></div>
                <h2 style={cardStyles.title}>Welcome Back</h2>
                <p style={cardStyles.sub}>Sign in to continue your encrypted conversations.</p>
                <div style={cardStyles.field}>
                  <span style={cardStyles.fieldIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d99" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </span>
                  <input style={cardStyles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div style={cardStyles.field}>
                  <span style={cardStyles.fieldIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d99" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input style={cardStyles.input} type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" style={cardStyles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d66" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={cardStyles.link}>Forgot password?</span>
                </div>
                {error && <p style={cardStyles.error}>{error}</p>}
                <button style={{ ...cardStyles.signInBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"} <span style={{ marginLeft: 8 }}>→</span>
                </button>
                <div style={cardStyles.orRow}>
                  <div style={cardStyles.orLine}/><span style={cardStyles.orText}>or</span><div style={cardStyles.orLine}/>
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
  root: { minHeight: "100vh", background: "#050d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani', 'Arial', sans-serif", overflow: "hidden", position: "relative" },
  content: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", width: "100%", maxWidth: "1440px", flexWrap: "wrap", gap: "0px" },
  left: { flex: "1 1 320px", maxWidth: "380px", display: "flex", flexDirection: "column", gap: "18px", padding: "20px" },
  center: { flex: "0 0 500px", display: "flex", alignItems: "center", justifyContent: "center" },
  right: { flex: "1 1 320px", maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px" },
  logo: { display: "flex", alignItems: "center", gap: "14px" },
  logoIconWrap: { filter: "drop-shadow(0 0 10px #00ff9d99)" },
  logoTextWrap: { display: "flex", flexDirection: "column", lineHeight: 1 },
  logoLine1: { fontSize: "30px", fontWeight: 800, color: "#ffffff", letterSpacing: "4px", fontFamily: "'Orbitron', 'Arial', sans-serif" },
  logoLine2: { fontSize: "30px", fontWeight: 800, color: "#00ff9d", letterSpacing: "4px", fontFamily: "'Orbitron', 'Arial', sans-serif", filter: "drop-shadow(0 0 6px #00ff9d88)" },
  headlineWrap: { display: "flex", flexDirection: "column", gap: "2px" },
  h1white: { fontSize: "clamp(20px, 2.5vw, 32px)", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 },
  h1cyan: { fontSize: "clamp(20px, 2.5vw, 32px)", fontWeight: 700, color: "#00ff9d", margin: 0, lineHeight: 1.2, filter: "drop-shadow(0 0 8px #00ff9d66)" },
  tagline: { color: "#8899aa", fontSize: "13px", lineHeight: 1.6, margin: 0 },
  features: { display: "flex", gap: "10px" },
  featureCard: { flex: 1, background: "#0a1628cc", border: "1px solid #00ff9d1a", borderRadius: "10px", padding: "14px 10px", display: "flex", flexDirection: "column", gap: "8px", backdropFilter: "blur(8px)" },
  featureIconWrap: { filter: "drop-shadow(0 0 4px #00ff9d88)" },
  featureTitle: { fontSize: "11px", fontWeight: 700, color: "#fff", whiteSpace: "pre-line", lineHeight: 1.3, fontFamily: "'Orbitron', sans-serif" },
  featureDesc: { fontSize: "10px", color: "#8899aa", lineHeight: 1.5 },
  quote: { display: "flex", gap: "10px", alignItems: "flex-start", padding: "4px 0" },
  quoteMark: { fontSize: "32px", color: "#00ff9d", lineHeight: 1, fontFamily: "Georgia, serif", flexShrink: 0, marginTop: "-4px" },
  quoteText: { fontSize: "12px", color: "#aabbcc", lineHeight: 1.7, margin: "0 0 6px 0", fontStyle: "italic" },
  quoteAuthor: { fontSize: "11px", color: "#00ff9d", margin: 0, fontWeight: 600 },
  statsCard: { background: "#0a1628cc", border: "1px solid #00ff9d1a", borderRadius: "10px", padding: "14px 10px", display: "flex", justifyContent: "space-between", backdropFilter: "blur(8px)" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" },
  statIcon: { filter: "drop-shadow(0 0 3px #00ff9d88)" },
  statVal: { fontSize: "15px", fontWeight: 700, color: "#fff", fontFamily: "'Orbitron', sans-serif" },
  statLabel: { fontSize: "9px", color: "#8899aa", textAlign: "center" },
  card: { width: "100%", maxWidth: "400px", background: "linear-gradient(135deg, #0d1f3c 0%, #0a1628 100%)", border: "1px solid #00ff9d2a", borderRadius: "16px", overflow: "hidden", boxShadow: "0 0 40px #00ff9d14, 0 0 80px #0066ff08", backdropFilter: "blur(20px)" },
  credit: { color: "#334455", fontSize: "11px", marginTop: "4px" },
};

const cardStyles = {
  form: { padding: "32px 28px", display: "flex", flexDirection: "column", gap: "14px" },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: "4px", filter: "drop-shadow(0 0 10px #00ff9d88)" },
  title: { color: "#fff", fontSize: "22px", fontWeight: 700, textAlign: "center", margin: 0, fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" },
  sub: { color: "#8899aa", fontSize: "12px", textAlign: "center", lineHeight: 1.5, margin: 0 },
  field: { display: "flex", alignItems: "center", gap: "10px", background: "#0a1628", border: "1px solid #00ff9d2a", borderRadius: "8px", padding: "12px 14px" },
  fieldIcon: { flexShrink: 0, display: "flex", alignItems: "center" },
  input: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", fontFamily: "'Rajdhani', sans-serif" },
  eyeBtn: { background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" },
  link: { color: "#00ff9d", cursor: "pointer", fontSize: "12px" },
  terms: { fontSize: "11px", color: "#8899aa", margin: 0 },
  termsBottom: { fontSize: "11px", color: "#8899aa", textAlign: "center", margin: 0, lineHeight: 1.6 },
  error: { color: "#ff4466", fontSize: "12px", margin: 0, textAlign: "center" },
  signInBtn: { width: "100%", padding: "14px", background: "linear-gradient(90deg, #00cc7a, #00ff9d)", border: "none", borderRadius: "8px", color: "#050d1a", fontSize: "15px", fontWeight: 700, cursor: "pointer", letterSpacing: "1px", fontFamily: "'Orbitron', sans-serif", boxShadow: "0 0 20px #00ff9d44", display: "flex", alignItems: "center", justifyContent: "center" },
  orRow: { display: "flex", alignItems: "center", gap: "12px" },
  orLine: { flex: 1, height: "1px", background: "#1a2a3a" },
  orText: { color: "#556677", fontSize: "12px" },
  createBtn: { width: "100%", padding: "13px", background: "transparent", border: "1px solid #00ff9d33", borderRadius: "8px", color: "#00ff9d", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "1px" },
  switchText: { fontSize: "12px", color: "#8899aa", textAlign: "center", margin: 0 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap');
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
  @keyframes pulseOpacity { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
  @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
  input::placeholder { color: #445566; }
  input:focus { outline: none; }
  * { box-sizing: border-box; }
`;
