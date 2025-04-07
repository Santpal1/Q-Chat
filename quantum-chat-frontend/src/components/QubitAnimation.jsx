import { useEffect, useState } from "react";
import "../index.css"; // Ensure styles are loaded

const QubitAnimation = ({ originalMessage, eveDetected }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timeout);
  }, [originalMessage]);

  if (!visible) return null;

  return (
    <div className="qubit-animation-tunnel">
      {originalMessage.split("").map((char, index) => (
        <div
          key={index}
          className={`qubit-orb ${eveDetected ? "qubit-glitch" : ""}`}
          style={{ animationDelay: `${index * 0.2}s` }}
          title={char}
        />
      ))}
    </div>
  );
};

export default QubitAnimation;
