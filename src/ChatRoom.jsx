import { useState, useEffect, useRef, useCallback } from "react";
import { getMessages, publishKey, getRoomKeys } from "./api";
import { useWebSocket } from "./useWebSocket";
import { exportPublicKey, importPublicKey, deriveSharedKey, encryptMessage, decryptMessage } from "./crypto";
import { getOrCreateKeyPair } from "./keystore";

function formatTime(iso) {
  const normalized = iso.endsWith("Z") ? iso : iso + "Z";
  return new Date(normalized).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Avatar({ name, size = 36 }) {
  const colors = ["#00cc7a", "#0088ff", "#aa44ff", "#ff6644", "#ffaa00"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}33, ${color}88)`,
      border: `1.5px solid ${color}66`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color, flexShrink: 0,
      fontFamily: "Orbitron, sans-serif", boxShadow: `0 0 10px ${color}33`
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default function ChatRoom({ room, token, userId, username, onBack }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [status, setStatus]       = useState("Setting up encryption...");
  const [ready, setReady]         = useState(false);
  const [replyTo, setReplyTo]     = useState(null);
  const [typing, setTyping]       = useState(null);
  const bottomRef    = useRef(null);
  const myKeys       = useRef(null);
  const sharedKeys   = useRef({});
  const usernameMap  = useRef({});
  const touchStart   = useRef(null);
  const typingTimer  = useRef(null);
  const pollInterval = useRef(null);
  const sentIds      = useRef(new Set());

  async function refreshSharedKeys() {
    if (!myKeys.current) return 0;
    let keys = [];
    try {
      // FIXED: correct arg order (roomId, token)
      keys = await getRoomKeys(room.id, token);
    } catch (e) {
      console.error("getRoomKeys failed:", e);
      return 0;
    }
    if (!Array.isArray(keys)) return 0;
    for (const entry of keys) {
      usernameMap.current[entry.user_id] = entry.username;
      if (Number(entry.user_id) === Number(userId)) continue;
      if (sharedKeys.current[entry.user_id]) continue;
      try {
        const theirPub = await importPublicKey(entry.public_key);
        sharedKeys.current[entry.user_id] = await deriveSharedKey(myKeys.current.privateKey, theirPub);
      } catch (e) {
        console.error("key derivation failed:", e);
      }
    }
    return Object.keys(sharedKeys.current).length;
  }

  async function tryDecrypt(recipients, senderId) {
    if (!recipients) return "[no content]";
    if (recipients.solo) {
      try { return decodeURIComponent(escape(atob(recipients.solo.ciphertext))); }
      catch { return "[solo decrypt failed]"; }
    }
    const mySlice = recipients[String(userId)];
    if (!mySlice) return "[message sent before you joined]";
    let keyToUse;
    if (Number(senderId) === Number(userId)) {
      keyToUse = Object.values(sharedKeys.current)[0];
    } else {
      if (!sharedKeys.current[senderId]) await refreshSharedKeys();
      keyToUse = sharedKeys.current[senderId];
    }
    if (!keyToUse) return "[key not available]";
    try { return await decryptMessage(keyToUse, mySlice.ciphertext, mySlice.iv); }
    catch { return "[decrypt failed]"; }
  }

  async function loadMessages() {
    try {
      const msgs = await getMessages(token, room.id);
      if (!Array.isArray(msgs)) return;
      const reversed = [...msgs].reverse();
      const decoded = await Promise.all(
        reversed.map(async (msg) => ({
          ...msg,
          _plaintext: await tryDecrypt(msg.recipients, msg.sender_id),
          _username: usernameMap.current[msg.sender_id] ?? "user" + msg.sender_id
        }))
      );
      setMessages(decoded);
    } catch (e) {
      console.error("loadMessages failed:", e);
    }
  }

  useEffect(() => {
    async function setupEncryption() {
      try {
        setStatus("Loading your key pair...");
        const keyPair = await getOrCreateKeyPair(room.id, userId);
        myKeys.current = keyPair;
        const pubB64 = await exportPublicKey(keyPair.publicKey);
        setStatus("Publishing your public key...");
        await publishKey(room.id, token, pubB64);
        const peerCount = await refreshSharedKeys();
        if (peerCount > 0) {
          setStatus("Encrypted channel ready");
          setReady(true);
          await loadMessages();
        } else {
          setStatus("Waiting for someone to join...");
          pollInterval.current = setInterval(async () => {
            const count = await refreshSharedKeys();
            if (count > 0) {
              clearInterval(pollInterval.current);
              setStatus("Encrypted channel ready");
              setReady(true);
              await loadMessages();
            }
          }, 3000);
        }
      } catch (e) {
        console.error("setupEncryption failed:", e);
        setStatus("Setup failed: " + e.message);
      }
    }
    setupEncryption();
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [room.id]);

  const handleIncoming = useCallback(async (msg) => {
    // FIXED: typing indicator uses type field matching websocket.py
    if (msg.type === "typing") {
      setTyping(msg.username);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(null), 3000);
      return;
    }

    if (msg.type !== "message") return;

    // Skip echo of our own messages
    if (Number(msg.sender_id) === Number(userId)) {
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === null && sentIds.current.has(m._temp_id));
        if (idx === -1) return prev;
        const next = [...prev];
        sentIds.current.delete(next[idx]._temp_id);
        next[idx] = { ...next[idx], id: msg.id };
        return next;
      });
      return;
    }

    await refreshSharedKeys();
    const text = await tryDecrypt(msg.recipients, msg.sender_id);
    setMessages(prev => [...prev, {
      ...msg,
      _plaintext: text,
      _username: usernameMap.current[msg.sender_id] ?? "user" + msg.sender_id
    }]);
  }, [userId]);

  const { send, sendTyping } = useWebSocket(room.id, token, handleIncoming);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function handleInputChange(e) {
    setInput(e.target.value);
    // FIXED: use sendTyping with username
    sendTyping(username);
 }
	async function handleSend(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() || !ready) return;
    const text = input.trim();
    setInput("");

    const peers = Object.entries(sharedKeys.current);
    const replyId = replyTo ? replyTo.id : null;
    setReplyTo(null);

    const tempId = Date.now() + Math.random();
    sentIds.current.add(tempId);

    if (peers.length === 0) {
      const ciphertext = btoa(unescape(encodeURIComponent(text)));
      setMessages(prev => [...prev, {
        id: null, _temp_id: tempId, sender_id: userId,
        recipients: { solo: { ciphertext, iv: "none" } },
        _plaintext: text, _username: username,
        created_at: new Date().toISOString(), reply_to_id: replyId,
      }]);
      send({ reply_to_id: replyId, recipients: { solo: { ciphertext, iv: "none" } } });
      return;
    }

    const recipients = {};
    for (const [peerId, sharedKey] of peers) {
      const { ciphertext, iv } = await encryptMessage(sharedKey, text);
      recipients[String(peerId)] = { ciphertext, iv };
    }
    const { ciphertext: selfCt, iv: selfIv } = await encryptMessage(peers[0][1], text);
    recipients[String(userId)] = { ciphertext: selfCt, iv: selfIv };

    setMessages(prev => [...prev, {
      id: null, _temp_id: tempId, sender_id: userId,
      recipients,
      _plaintext: text, _username: username,
      created_at: new Date().toISOString(), reply_to_id: replyId,
    }]);

    send({ reply_to_id: replyId, recipients });
  }

  function onTouchStart(e) { touchStart.current = e.touches[0].clientX; }
  function onTouchEnd(e, msg) {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > 60) setReplyTo({ id: msg.id, plaintext: msg._plaintext, username: msg._username });
    touchStart.current = null;
  }
  function onDblClick(msg) {
    setReplyTo({ id: msg.id, plaintext: msg._plaintext, username: msg._username });
  }

  function getReplyPreview(replyToId) {
    const original = messages.find(m => m.id === replyToId);
    return original ? { text: original._plaintext, username: original._username } : null;
  }

  return (
    <div style={s.root}>
      <style>{css}</style>

      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <Avatar name={room.name} size={40} />
        <div style={s.headerInfo}>
          <div style={s.headerName}>{room.name}</div>
          <div style={s.headerStatus}>
            <span style={s.statusDot}/>
            <span style={s.statusText}>{status === "Encrypted channel ready" ? "Online · Encrypted" : status}</span>
          </div>
        </div>
        <div style={s.headerActions}>
          <div style={s.inviteChip}>{room.invite_code}</div>
        </div>
      </div>

      <div style={s.encryptBanner}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Messages are end-to-end encrypted. Only you and recipients can read them.</span>
      </div>

      <div style={s.messages}>
        {messages.map((msg, i) => {
          const mine = Number(msg.sender_id) === Number(userId);
          const replyPreview = msg.reply_to_id ? getReplyPreview(msg.reply_to_id) : null;
          const prevMsg = messages[i - 1];
          const showAvatar = !mine && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
          return (
            <div
              key={msg.id ?? msg._temp_id ?? i}
              style={{ ...s.msgRow, justifyContent: mine ? "flex-end" : "flex-start", marginTop: showAvatar ? 10 : 3 }}
              onTouchStart={onTouchStart}
              onTouchEnd={(e) => onTouchEnd(e, msg)}
              onDoubleClick={() => onDblClick(msg)}
            >
              {!mine && (
                <div style={{ width: 32, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>
                  {showAvatar && <Avatar name={msg._username} size={30} />}
                </div>
              )}
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                {showAvatar && !mine && <span style={s.senderName}>{msg._username}</span>}
                <div style={{
                  ...s.bubble,
                  background: mine ? "linear-gradient(135deg, #005c3d, #007a52)" : "#0d1f3c",
                  borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  border: mine ? "1px solid #00ff9d33" : "1px solid #1a2a3a",
                  boxShadow: mine ? "0 2px 12px #00ff9d1a" : "0 2px 8px #00000033",
                }}>
                  {replyPreview && (
                    <div style={s.replyQuote}>
                      <span style={s.replyQuoteUser}>{replyPreview.username}</span>
                      <span style={s.replyQuoteText}>
                        {replyPreview.text ? replyPreview.text.slice(0, 60) : ""}
                        {replyPreview.text && replyPreview.text.length > 60 ? "..." : ""}
                      </span>
                    </div>
                  )}
                  <span style={s.bubbleText}>{msg._plaintext ?? "..."}</span>
                  <div style={s.bubbleMeta}>
                    <span style={s.bubbleTime}>{msg.created_at ? formatTime(msg.created_at) : ""}</span>
                    {mine && (
                      <svg width="14" height="10" viewBox="0 0 16 10" fill="none" style={{ marginLeft: 3 }}>
                        <path d="M1 5l3 3 7-7" stroke="#00ff9d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 5l3 3 7-7" stroke="#00ff9d88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div style={{ display: "flex", alignItems: "flex-end", marginTop: 6, marginBottom: 2 }}>
            <div style={{ width: 32, marginRight: 8, flexShrink: 0 }}>
              <Avatar name={typing} size={28} />
            </div>
            <div style={{ background: "#0d1f3c", border: "1px solid #00ff9d33", borderRadius: "16px 16px 16px 4px", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00ff9d99", fontSize: 12, fontFamily: "Rajdhani, sans-serif" }}>{typing} is typing</span>
              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff9d", display: "inline-block", animation: "typingBlink 1.2s infinite 0s" }} />
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff9d", display: "inline-block", animation: "typingBlink 1.2s infinite 0.4s" }} />
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff9d", display: "inline-block", animation: "typingBlink 1.2s infinite 0.8s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div style={s.replyBar}>
          <div style={s.replyBarContent}>
            <span style={s.replyBarLabel}>Replying to {replyTo.username}</span>
            <span style={s.replyBarText}>
              {replyTo.plaintext ? replyTo.plaintext.slice(0, 60) : ""}
              {replyTo.plaintext && replyTo.plaintext.length > 60 ? "..." : ""}
            </span>
          </div>
          <button style={s.replyClose} onClick={() => setReplyTo(null)}>✕</button>
        </div>
      )}

      <div style={s.inputBar}>
        <button type="button" style={s.inputIconBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#556677" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <input
          style={{ ...s.input, flex: 1, opacity: ready ? 1 : 0.5 }}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          placeholder={ready ? "Type a message..." : status}
          disabled={!ready}
        />
        <button type="button" style={s.inputIconBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#556677" strokeWidth="1.8"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </button>
        <button
          type="button"
          style={{ ...s.sendBtn, opacity: ready && input.trim() ? 1 : 0.4 }}
          onClick={handleSend}
          disabled={!ready || !input.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="#050d1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22 11 13 2 9l20-7z" stroke="#050d1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", flexDirection: "column", height: "100vh", background: "#050d1a", fontFamily: "Rajdhani, Arial, sans-serif", width: "100%" },
  header: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0a1628", borderBottom: "1px solid #0d2a1f" },
  backBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px 6px", marginRight: 2 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "Rajdhani, sans-serif" },
  headerStatus: { display: "flex", alignItems: "center", gap: 5, marginTop: 1 },
  statusDot: { width: 7, height: 7, borderRadius: "50%", background: "#00ff9d", boxShadow: "0 0 6px #00ff9d", flexShrink: 0 },
  statusText: { fontSize: 11, color: "#00ff9d" },
  headerActions: { display: "flex", alignItems: "center", gap: 8 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 },
  inviteChip: { background: "#0d2a1f", border: "1px solid #00ff9d33", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#00ff9d88", fontFamily: "monospace" },
  encryptBanner: { display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "#050d1a", borderBottom: "1px solid #0a1628", fontSize: 11, color: "#334455", justifyContent: "center" },
  messages: { flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column" },
  msgRow: { display: "flex", alignItems: "flex-end", width: "100%" },
  senderName: { fontSize: 11, color: "#00ff9d88", marginBottom: 3, paddingLeft: 2 },
  bubble: { padding: "10px 13px", wordBreak: "break-word", position: "relative" },
  bubbleText: { fontSize: 15, color: "#e8f4f0", lineHeight: 1.4, display: "block" },
  bubbleMeta: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, marginTop: 4 },
  bubbleTime: { fontSize: 10, color: "#445566" },
  replyQuote: { borderLeft: "3px solid #00ff9d88", paddingLeft: 8, marginBottom: 7, opacity: 0.85 },
  replyQuoteUser: { display: "block", fontSize: 10, color: "#00ff9d", fontWeight: 700, marginBottom: 2 },
  replyQuoteText: { display: "block", fontSize: 11, color: "#8899aa" },
  replyBar: { display: "flex", alignItems: "center", background: "#0a1628", borderTop: "1px solid #0d2a1f", padding: "8px 14px", gap: 8 },
  replyBarContent: { flex: 1, borderLeft: "3px solid #00ff9d", paddingLeft: 10 },
  replyBarLabel: { display: "block", fontSize: 11, color: "#00ff9d", fontWeight: 700 },
  replyBarText: { display: "block", fontSize: 12, color: "#556677", marginTop: 2 },
  replyClose: { background: "none", border: "none", color: "#556677", cursor: "pointer", fontSize: 14, padding: "2px 6px" },
  inputBar: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#0a1628", borderTop: "1px solid #0d2a1f" },
  inputIconBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, flexShrink: 0 },
  input: { width: "100%", background: "#0d1f3c", border: "1px solid #1a2a3a", borderRadius: 24, padding: "10px 16px", color: "#fff", fontSize: 15, outline: "none", fontFamily: "Rajdhani, sans-serif" },
  sendBtn: { width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #00cc7a, #00ff9d)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 16px #00ff9d44", transition: "opacity 0.2s" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  input::placeholder { color: #334455; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #00ff9d22; }
  @keyframes typingBlink { 0%,100%{opacity:0.3} 50%{opacity:1} }
`;
