// SocketListener.jsx
import { useEffect } from "react";
import socket from "./socket";

const SocketListener = ({ onMessage }) => {
  useEffect(() => {
    socket.on("receive_message", onMessage);

    return () => {
      socket.off("receive_message", onMessage);
    };
  }, [onMessage]);

  return null;
};

export default SocketListener;
