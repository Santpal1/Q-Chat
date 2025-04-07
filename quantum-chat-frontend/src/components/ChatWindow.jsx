import { useState } from "react";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble";
import QuantumSimulationPanel from "./QuantumSimulationPanel";
import QubitFlowAnimation from "./QubitFlowAnimation"; // <- Handles animation

const sendSound = new Audio("/sounds/recieve.mp3");
const receiveSound = new Audio("/sounds/recieve.mp3");

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      text: "Welcome to Quantum Chat ⚛️",
      sender: "System",
      receiver: "All"
    }
  ]);

  const [user, setUser] = useState("Alice");
  const [simulation, setSimulation] = useState(null);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false); // 👈 track when animation completes

  const sendMessage = async (userText) => {
    const receiver = user === "Alice" ? "Bob" : "Alice";

    setMessages((prev) => [
      ...prev,
      { text: userText, sender: user, receiver }
    ]);
    sendSound.play();

    try {
      const response = await fetch("http://localhost:5000/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: user,
          receiver,
          message: userText,
          eve_present: false,
          chaos_level: 0.9
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.sender === user) {
          setSimulation({
            sender: data.sender,
            receiver: data.receiver,
            original_message: data.original_message,
            encrypted_bits: data.encrypted_bits,
            decrypted_message: data.decrypted_message,
            eve_detected: data.eve_detected
          });
          setShowSummaryPanel(false); // reset animation and summary panel
        }

        if (data.receiver === user) {
          setMessages((prev) => [
            ...prev,
            {
              text: data.decrypted_message,
              sender: data.sender,
              receiver: data.receiver
            }
          ]);
          receiveSound.play();
        }
      }

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ Backend error occurred",
          sender: "System",
          receiver: "All"
        }
      ]);
      setSimulation(null);
    }
  };

  const visibleMessages = messages.filter(
    (msg) =>
      msg.sender === user || msg.receiver === user || msg.receiver === "All"
  );

  return (
    <div className="chat-layout-container">

      {/* 🔄 Qubit Animation Panel */}
      <div className="left-panel">
        {!showSummaryPanel && simulation ? (
          <QubitFlowAnimation
            simulation={simulation}
            active={true}
            onAnimationComplete={() => setShowSummaryPanel(true)}
          />
        ) : simulation ? (
          <div className="transmission-complete-msg">
            🚀 Transmission Completed
          </div>
        ) : (
          <div className="qubit-placeholder" />
        )}
      </div>

      {/* 💬 Main Chat */}
      <div className="chat-window">
        <div className="user-toggle">
          <span>Current User:</span>
          <select value={user} onChange={(e) => setUser(e.target.value)}>
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
          </select>
        </div>

        <div className="messages">
          {visibleMessages.map((msg, index) => (
            <MessageBubble
              key={index}
              text={msg.text}
              sender={msg.sender}
              currentUser={user}
            />
          ))}
        </div>

        <MessageInput onSend={sendMessage} />
      </div>

      {/* 🧾 Summary Panel */}
      {simulation && showSummaryPanel && (
        <div className="quantum-summary-panel">
          <QuantumSimulationPanel simulation={simulation} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
