const DB_NAME = "cipherchat-keys";
const STORE = "keypairs";
const VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function getOrCreateKeyPair(roomId, userId) {
  const id = `${roomId}-${userId}`;
  const db = await openDB();

  const existing = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });

  if (existing) {
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      existing.privateKeyRaw,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey"]
    );
    const publicKey = await crypto.subtle.importKey(
      "raw",
      existing.publicKeyRaw,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      []
    );
    return { privateKey, publicKey };
  }

  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );
  const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);

  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put({ id, privateKeyRaw, publicKeyRaw });
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });

  return keyPair;
}

export async function clearKeyPair(roomId, userId) {
  const id = `${roomId}-${userId}`;
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}
