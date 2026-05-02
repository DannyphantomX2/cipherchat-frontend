import { useState, useEffect, useRef, useCallback } from "react";
import { getMessages, publishKey, getRoomKeys } from "./api";
import { useWebSocket } from "./useWebSocket";
import { exportPublicKey, importPublicKey, deriveSharedKey, encryptMessage, decryptMessage } from "./crypto";
import { getOrCreateKeyPair } from "./keystore";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatRoom({ room, token, userId, username, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Setting up encryption...");
  const [ready, setReady] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);
  const myKeys = useRef(null);
  const sharedKeys = useRef({});
  const usernameMap = useRef({});
  const touchStart = useRef(null);

  async function refreshSharedKeys() {
    if (!myKeys.current) return;
    const keys = await getRoomKeys(token, room.id);
    for (const entry of keys) {
      usernameMap.current[entry.user_id] = entry.username;
      if (entry.user_id === userId || sharedKeys.current[entry.user_id]) continue;
      const theirPub = await importPublicKey(entry.public_key);
      sharedKeys.current[entry.user_id] = await deriveSharedKey(myKeys.current.privateKey, theirPub);
    }
  }

  async function setupEncryption() {
    setStatus("Loading your key pair...");
    const keyPair = await getOrCreateKeyPair(room.id);
    myKeys.current = keyPair;
    const pubB64 = await exportPublicKey(keyPair.publicKey);
    setStatus("Publishing your public key...");
    await publishKey(token, room.id, pubB64);
    await refreshSharedKeys();
    setStatus("Encrypted channel ready");
    setReady(true);
  }

  async function tryDecrypt(recipients, senderId) {
    if (!recipients) return "[no content]";
    if (recipients.solo) {
      try { return atob(recipients.solo.ciphertext); } catch { return "[solo decrypt failed]"; }
    }
    const mySlice = recipients[String(userId)];
    if (!mySlice) return "[message sent before you joined]";
    let keyToUse;
    if (senderId === userId) {
      keyToUse = Object.values(sharedKeys.current)[0];
    } else {
      if (!sharedKeys.current[senderId]) await refreshSharedKeys();
      keyToUse = sharedKeys.current[senderId];
    }
    if (!keyToUse) return "[key not available]";
    try {
      return await decryptMessage(keyToUse, mySlice.ciphertext, mySlice.iv);
    } catch {
      return "[decrypt failed]";
    }
  }

  useEffect(() => {
    setupEncryption().then(async () => {
      const msgs = await getMessages(token, room.id);
      const reversed = [...msgs].reverse();
      const decoded = await Promise.all(
        reversed.map(async (msg) => ({
          ...msg,
          _plaintext: await tryDecrypt(msg.recipients, msg.sender_id),
          _username: usernameMap.current[msg.sender_id] ?? "user" + msg.sender_id
        }))
      );
      setMessages(decoded);
    });
  }, [room.id]);

  const handleIncoming = useCallback(async (msg) => {
    await refreshSharedKeys();
    const text = await tryDecrypt(msg.recipients, msg.sender_id);
    setMessages(prev => [...prev, {
      ...msg,
      _plaintext: text,
      _username: usernameMap.current[msg.sender_id] ?? "user" + msg.sender_id
    }]);
  }, []);

  const { send } = useWebSocket(room.id, token, handleIncoming);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !ready) return;
    const text = input.trim();
    setInput("");
    const peers = Object.entries(sharedKeys.current);
    const payload = { reply_to_id: replyTo ? replyTo.id : null };
    setReplyTo(null);
    if (peers.length === 0) {
      send({ ...payload, recipients: { solo: { ciphertext: btoa(text), iv: "none" } } });
      return;
    }
    const recipients = {};
    for (const [peerId, sharedKey] of peers) {
      const { ciphertext, iv } = await encryptMessage(sharedKey, text);
      recipients[String(peerId)] = { ciphertext, iv };
    }
    const { ciphertext: selfCt, iv: selfIv } = await encryptMessage(peers[0][1], text);
    recipients[String(userId)] = { ciphertext: selfCt, iv: selfIv };
    send({ ...payload, recipients });
  }

  function onTouchStart(e) {
    touchStart.current = e.touches[0].clientX;
  }

  function onTouchEnd(e, msg) {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > 60) {
      setReplyTo({ id: msg.id, plaintext: msg._plaintext, username: msg._username });
    }
    touchStart.current = null;
  }

  function getReplyPreview(replyToId) {
    const original = messages.find(m => m.id === replyToId);
    return original ? { text: original._plaintext, username: original._username } : null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={onBack}>←</button>
        <div style={styles.headerCenter}>
          <span style={styles.roomName}>{room.name}</span>
          <span style={styles.statusLine}>{status}</span>
        </div>
        <span style={styles.code}>Invite: {room.invite_code}</span>
      </div>
      <div style={styles.messages}>
        {messages.map((msg, i) => {
          const mine = msg.sender_id === userId;
          const replyPreview = msg.reply_to_id ? getReplyPreview(msg.reply_to_id) : null;
          return (
            <div
              key={msg.id ?? i}
              style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}
              onTouchStart={onTouchStart}
              onTouchEnd={(e) => onTouchEnd(e, msg)}
            >
              <span style={styles.msgMeta}>
                {!mine && <span style={styles.msgUsername}>{msg._username} · </span>}
                <span style={styles.msgTime}>{msg.created_at ? formatTime(msg.created_at) : ""}</span>
              </span>
              <div style={{ ...styles.bubble, background: mine ? "#7c3aed" : "#1e1e1e" }}>
                {replyPreview && (
                  <div style={styles.replyQuote}>
                    <span style={styles.replyQuoteUser}>{replyPreview.username}</span>
                    <span style={styles.replyQuoteText}>
                      {replyPreview.text ? replyPreview.text.slice(0, 60) : ""}
                      {replyPreview.text && replyPreview.text.length > 60 ? "..." : ""}
                    </span>
                  </div>
                )}
                {msg._plaintext ?? "..."}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {replyTo && (
        <div style={styles.replyBar}>
          <div style={styles.replyBarContent}>
            <span style={styles.replyBarLabel}>Replying to {replyTo.username}</span>
            <span style={styles.replyBarText}>
              {replyTo.plaintext ? replyTo.plaintext.slice(0, 60) : ""}
              {replyTo.plaintext && replyTo.plaintext.length > 60 ? "..." : ""}
            </span>
          </div>
          <button style={styles.replyBarClose} onClick={() => setReplyTo(null)}>x</button>
        </div>
      )}
      <form style={styles.inputRow} onSubmit={handleSend}>
        <input
          style={{ ...styles.input, opacity: ready ? 1 : 0.5 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={ready ? "Type a message..." : "Setting up encryption..."}
          disabled={!ready}
        />
        <button style={{ ...styles.sendBtn, opacity: ready ? 1 : 0.5 }} type="submit" disabled={!ready}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", height: "100vh", background: "#0f0f0f" },
  header: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#1a1a1a", borderBottom: "1px solid #2a2a2a" },
  back: { background: "none", border: "none", color: "#aaa", fontSize: "1.2rem", cursor: "pointer" },
  headerCenter: { flex: 1, display: "flex", flexDirection: "column" },
  roomName: { color: "#fff", fontWeight: 600 },
  statusLine: { color: "#22c55e", fontSize: "0.72rem", marginTop: "2px" },
  code: { color: "#666", fontSize: "0.75rem" },
  messages: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" },
  msgMeta: { fontSize: "0.72rem", marginBottom: "3px", color: "#555" },
  msgUsername: { color: "#a78bfa" },
  msgTime: { color: "#444" },
  bubble: { maxWidth: "70%", padding: "10px 14px", borderRadius: "12px", color: "#fff", fontSize: "0.9rem", wordBreak: "break-word" },
  replyQuote: { borderLeft: "3px solid #a78bfa", paddingLeft: "8px", marginBottom: "6px", opacity: 0.8 },
  replyQuoteUser: { display: "block", fontSize: "0.72rem", color: "#a78bfa", fontWeight: 600, marginBottom: "2px" },
  replyQuoteText: { display: "block", fontSize: "0.8rem", color: "#ccc" },
  replyBar: { display: "flex", alignItems: "center", background: "#1a1a1a", borderTop: "1px solid #2a2a2a", padding: "8px 16px", gap: "8px" },
  replyBarContent: { flex: 1, borderLeft: "3px solid #7c3aed", paddingLeft: "10px" },
  replyBarLabel: { display: "block", fontSize: "0.72rem", color: "#a78bfa", fontWeight: 600 },
  replyBarText: { display: "block", fontSize: "0.8rem", color: "#888", marginTop: "2px" },
  replyBarClose: { background: "none", border: "none", color: "#666", fontSize: "1rem", cursor: "pointer", padding: "4px" },
  inputRow: { display: "flex", gap: "8px", padding: "12px 16px", borderTop: "1px solid #2a2a2a", background: "#1a1a1a" },
  input: { flex: 1, padding: "10px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#fff", fontSize: "0.9rem" },
  sendBtn: { padding: "10px 18px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }
};
