// Persists ECDH keypairs in IndexedDB keyed by roomId.
// Same room = same keypair every session = old messages stay readable.

const DB_NAME = "cipherchat-keys";
const STORE = "keypairs";
const VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE, { keyPath: "roomId" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function getOrCreateKeyPair(roomId) {
  const db = await openDB();

  // Try to load existing keypair for this room
  const existing = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(roomId);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });

  if (existing) {
    // Re-import the stored CryptoKey objects
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

  // Generate fresh keypair and store it
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);

  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put({ roomId, privateKeyRaw, publicKeyRaw });
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });

  return keyPair;
}

export async function clearKeyPair(roomId) {
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(roomId);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}
