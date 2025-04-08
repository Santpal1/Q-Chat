import { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import './index.css';
import { io } from 'socket.io-client';

const socket = io("https://q-chat-5vjc.onrender.com"); // Adjust if hosted elsewhere

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [simulation, setSimulation] = useState(null);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    socket.on("connect", () => console.log("✅ Connected", socket.id));
    socket.on("disconnect", () => console.log("❌ Disconnected"));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("🔁 Socket received:", data); // 🔍 Debug
      setIncomingMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light', !isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="app-container">
      <div className="qchat-logo">Q-Chat</div>

      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: '1px solid var(--box-glow)',
            color: 'var(--text-color)',
            padding: '8px 14px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            boxShadow: '0 0 8px var(--box-glow)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <ChatWindow
        socket={socket}
        incomingMessages={incomingMessages}
        externalSimulation={simulation}
        resetSimulation={() => setSimulation(null)}
      />
    </div>
  );
}

export default App;
