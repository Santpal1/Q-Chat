// socket.js
import { io } from "socket.io-client";

const socket = io("https://q-chat-5vjc.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true, // ensure it tries to reconnect
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

export default socket;
