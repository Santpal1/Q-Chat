import { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import './index.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Apply class to body based on theme
  useEffect(() => {
    document.body.classList.toggle('light', !isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="app-container">
      {/* Glowing Q-Chat Logo */}
      <div className="qchat-logo">Q-Chat</div>

      {/* Theme toggle button */}
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

      <ChatWindow />
    </div>
  );
}

export default App;
