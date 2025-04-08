import { useState, useRef, useEffect } from "react";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble";
import QuantumSimulationPanel from "./QuantumSimulationPanel";
import QubitFlowAnimation from "./QubitFlowAnimation";

const sendSound = new Audio("/sounds/recieve.mp3");
const receiveSound = new Audio("/sounds/recieve.mp3");

const ChatWindow = ({ socket, incomingMessages }) => {
  const [messages, setMessages] = useState([
    {
      text: "Welcome to Quantum Chat ⚛️",
      sender: "System",
      receiver: "All"
    }
  ]);

  const [user, setUser] = useState("Alice");
  const [simulation, setSimulation] = useState(null);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [evePresent, setEvePresent] = useState(false);
  const [typingStatus, setTypingStatus] = useState("");

  const messagesEndRef = useRef(null);

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
          eve_present: evePresent,
          chaos_level: 0.9
        })
      });

      const data = await response.json();

      if (data.success && data.sender === user) {
        setSimulation({
          sender: data.sender,
          receiver: data.receiver,
          original_message: data.original_message,
          encrypted_bits: data.encrypted_bits,
          decrypted_message: data.decrypted_message,
          eve_detected: data.eve_detected
        });
        setShowSummaryPanel(false);
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

  useEffect(() => {
    socket.emit("user_joined", { username: user });
  
    socket.on("typing", (data) => {
      if (data.username !== user) {
        setTypingStatus(`${data.username} is typing...`);
      }
    });
  
    socket.on("stop_typing", (data) => {
      if (data.username !== user) {
        setTypingStatus("");
      }
    });
  
    return () => {
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [user]);
  

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  // ✅ Use socket messages passed from App
  useEffect(() => {
    if (incomingMessages.length === 0) return;
  
    const latest = incomingMessages[incomingMessages.length - 1];
  
    if (latest.receiver === user) {
      setMessages((prev) => [
        ...prev,
        {
          text: latest.decrypted_message,
          sender: latest.sender,
          receiver: latest.receiver
        }
      ]);
  
      receiveSound.play(); // 🔊 sound effect
  
      setSimulation({
        sender: latest.sender,
        receiver: latest.receiver,
        original_message: latest.original_message,
        encrypted_bits: latest.encrypted_bits,
        decrypted_message: latest.decrypted_message,
        eve_detected: latest.eve_detected
      });
  
      setShowSummaryPanel(false); // 🧬 hide old panel
    }
  }, [incomingMessages]);
  
  return (
    <div className="chat-layout-container">
      {/* Qubit Animation Panel */}
      <div className="left-panel">
        {!showSummaryPanel && simulation ? (
          <QubitFlowAnimation
            simulation={simulation}
            active={true}
            onAnimationComplete={() => setShowSummaryPanel(true)}
          />
        ) : simulation ? (
          <div className="transmission-complete-msg">
            Transmission Completed
          </div>
        ) : (
          <div className="qubit-placeholder" />
        )}
      </div>

      {/* Main Chat */}
      <div className="chat-window">
        <div className="user-toggle">
          <span>Current User:</span>
          <select value={user} onChange={(e) => setUser(e.target.value)}>
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
          </select>
        </div>

        {/* Eve Toggle */}
        <div className="eve-controls">
          <label>
            <input
              type="checkbox"
              checked={evePresent}
              onChange={(e) => setEvePresent(e.target.checked)}
            />
            Eavesdropper Present
          </label>
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
          <div ref={messagesEndRef} />
        </div>

        <MessageInput onSend={sendMessage} />
      </div>

      {/* Summary Panel */}
      {simulation && showSummaryPanel && (
        <div className="quantum-summary-panel">
          <QuantumSimulationPanel simulation={simulation} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
