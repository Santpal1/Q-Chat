import { useState } from "react";

const MessageInput = ({ onSend }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="input-container">
      <input
        type="text"
        className="message-input"
        placeholder="Type a quantum message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
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
