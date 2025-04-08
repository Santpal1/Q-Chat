import { useState, useEffect, useRef } from "react";

const MessageInput = ({ onSend, socket, currentUser }) => {
  const [input, setInput] = useState("");
  const typingTimeout = useRef(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
      socket.emit("stop_typing", { username: currentUser });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleTyping = (e) => {
    setInput(e.target.value);

    socket.emit("typing", { username: currentUser });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { username: currentUser });
    }, 2000);
  };

  return (
    <div className="input-container">
      <input
        type="text"
        className="message-input"
        placeholder="Type a quantum message..."
        value={input}
        onChange={handleTyping}
        onKeyDown={handleKeyPress}
      />
      <button
        className="send-button"
        onClick={handleSend}
        title="Send Message"
      >
        ➤
      </button>
    </div>
  );
};

export default MessageInput;
