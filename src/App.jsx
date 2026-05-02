import { useState, useEffect } from "react";
import Auth from "./Auth";
import Lobby from "./Lobby";
import ChatRoom from "./ChatRoom";
import { getMe } from "./api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    if (!token) return;
    getMe(token)
      .then(setUser)
      .catch(() => { localStorage.removeItem("token"); setToken(null); });
  }, [token]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUser(null);
    setRoom(null);
  }

  if (!token || !user) return <Auth onAuth={t => setToken(t)} />;
  if (room) return (
    <ChatRoom
      roomId={room.id}
      token={token}
      userId={user.id}
      username={user.username}
      onLeave={() => setRoom(null)}
    />
  );
  return <Lobby token={token} onSelectRoom={setRoom} onLogout={handleLogout} />;
}
