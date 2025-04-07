import { useEffect, useRef } from "react";

const MessageBubble = ({ text, sender, currentUser }) => {
  const isCurrentUser = sender === currentUser;
  const bubbleRef = useRef(null);

  useEffect(() => {
    if (bubbleRef.current) {
      const container = document.createElement("div");
      container.className = "particle-container";

      for (let i = 0; i < 10; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.background = isCurrentUser ? "#00f6ff" : "#5F9EA0";
        container.appendChild(particle);
      }

      bubbleRef.current.appendChild(container);

      setTimeout(() => {
        if (bubbleRef.current && container) {
          bubbleRef.current.removeChild(container);
        }
      }, 600); // match animation duration
    }
  }, []);

  return (
    <div
      className={`message-bubble ${isCurrentUser ? "message-sent" : "message-received"}`}
      ref={bubbleRef}
    >
      <div className="sender-label">
        <strong>{sender}:</strong>
      </div>
      <div className="message-text">{text}</div>
    </div>
  );
};

export default MessageBubble;
