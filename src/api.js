const BASE = "https://cipherchat-backend-fuqa.onrender.com";

export async function register(username, email, password) {
  const r = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });
  if (!r.ok) throw new Error((await r.json()).detail);
  return r.json();
}

export async function login(username, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!r.ok) throw new Error((await r.json()).detail);
  return r.json();
}

export async function getMe(token) {
  const r = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error("Auth failed");
  return r.json();
}

export async function getRooms(token) {
  const r = await fetch(`${BASE}/rooms`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return r.json();
}

export async function createRoom(token, name) {
  const r = await fetch(`${BASE}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name })
  });
  if (!r.ok) throw new Error((await r.json()).detail);
  return r.json();
}

export async function joinRoom(token, invite_code) {
  const r = await fetch(`${BASE}/rooms/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ invite_code })
  });
  if (!r.ok) throw new Error((await r.json()).detail);
  return r.json();
}

export async function getMessages(token, roomId) {
  const r = await fetch(`${BASE}/rooms/${roomId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return r.json();
}

export async function publishKey(token, roomId, public_key) {
  await fetch(`${BASE}/rooms/${roomId}/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ public_key })
  });
}

export async function getRoomKeys(token, roomId) {
  const r = await fetch(`${BASE}/rooms/${roomId}/keys`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return r.json();
}
