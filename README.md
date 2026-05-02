# CipherChat — Frontend

React frontend for CipherChat, a full-stack end-to-end encrypted chat application.

## Live App
`https://cipherchat-frontend-eta.vercel.app`

## Stack
- **React 18** + **Vite 4** — UI framework and build tool
- **Web Crypto API** — ECDH P-256 key exchange + AES-GCM 256 encryption
- **IndexedDB** — persistent keypair storage across sessions

## How Encryption Works
1. When you enter a room, your browser generates an ECDH P-256 keypair
2. Your public key is published to the server
3. Your browser fetches the other user's public key and derives a shared AES-GCM key
4. All messages are encrypted in your browser before being sent
5. The server stores and forwards only ciphertext — it never sees your messages
6. When you receive a message, your browser decrypts it locally

## How to Use
1. Go to the live URL and register an account
2. Click **Create Room** to start a new chat room
3. Share the invite code with someone you want to chat with
4. They click **Join Room**, enter the invite code, and you are connected
5. Messages are encrypted end-to-end once both users have exchanged keys

## Local Setup

```bash
git clone https://github.com/DannyphantomX2/cipherchat-frontend.git
cd cipherchat-frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

Make sure the backend is running locally or update `src/api.js` to point to the live backend URL.

## Project Structure

| File | Purpose |
|---|---|
| src/api.js | All HTTP requests to the backend |
| src/crypto.js | ECDH key exchange and AES-GCM encrypt/decrypt |
| src/keystore.js | IndexedDB keypair persistence |
| src/useWebSocket.js | WebSocket connection hook |
| src/Auth.jsx | Login and register forms |
| src/Lobby.jsx | Room list, create, join |
| src/ChatRoom.jsx | Real-time encrypted chat UI |
| src/App.jsx | Top-level routing and state |

## Known Limitations
- Clearing browser data wipes your IndexedDB keys — old messages become unreadable
- Late joiners cannot read messages sent before they joined — correct E2E behaviour
- 3+ person rooms use the first shared key only
