import { useEffect, useRef, useCallback } from "react";

export function useWebSocket(roomId, token, onMessage) {
  const ws = useRef(null);

  useEffect(() => {
    if (!roomId || !token) return;
    const socket = new WebSocket(
      `wss://cipherchat-backend-fuqa.onrender.com/ws/${roomId}?token=${token}`
    );

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch (err) {
        console.error("WS message parse error:", err, e.data);
      }
    };

    socket.onerror = (e) => console.error("WS error", e);
    socket.onclose = () => console.log("WS closed");
    ws.current = socket;
    return () => socket.close();
  }, [roomId, token]);

  const send = useCallback((payload) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
    }
  }, []);

  return { send };
}
