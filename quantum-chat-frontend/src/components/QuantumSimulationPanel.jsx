import { useEffect, useState } from "react";
import "../index.css";
import QubitAnimation from "./QubitAnimation";


const QuantumSimulationPanel = ({ simulation }) => {
  const [showQubits, setShowQubits] = useState(false);

  if (!simulation) return null;

  const {
    original_message,
    encrypted_bits,
    decrypted_message,
    eve_detected,
    sender,
    receiver
  } = simulation;

  const shortBits =
    encrypted_bits.length > 20
      ? encrypted_bits.slice(0, 20) + "..."
      : encrypted_bits;

  useEffect(() => {
    setShowQubits(true);
    const timeout = setTimeout(() => setShowQubits(false), 3000);
    return () => clearTimeout(timeout);
  }, [simulation]);

  return (
    <div className="quantum-panel-container">
      

      <div className="quantum-summary-panel">
        <h3>🧬 Quantum Transmission Summary</h3>
        <QubitAnimation originalMessage={original_message} eveDetected={eve_detected} />
        <p><strong>Sender:</strong> {sender}</p>
        <p><strong>Receiver:</strong> {receiver}</p>
        <p><strong>Original Message:</strong> {original_message}</p>
        <p><strong>Encrypted Bits:</strong> <code>{shortBits}</code></p>
        <p><strong>Decrypted Message:</strong> {decrypted_message}</p>
        <p>
          <strong>Eavesdropper Detected:</strong>{" "}
          <span className={eve_detected ? "danger" : "success"}>
            {eve_detected ? "Yes" : "No"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default QuantumSimulationPanel;
