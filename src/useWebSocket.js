import { useEffect, useRef, useCallback } from "react";

export function useWebSocket(roomId, token, onMessage) {
  const ws = useRef(null);

  useEffect(() => {
    if (!roomId || !token) return;
    const socket = new WebSocket(`wss://cipherchat-backend-fuqa.onrender.com/ws/${roomId}?token=${token}`);
    socket.onmessage = (e) => onMessage(JSON.parse(e.data));
    socket.onerror = (e) => console.error("WS error", e);
    socket.onclose = () => console.log("WS closed");
    ws.current = socket;
    return () => socket.close();
  }, [roomId, token]);

  // Accepts a full payload object e.g. { recipients: { ... } }
  const send = useCallback((payload) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
    }
  }, []);

  return { send };
}
