import { useEffect, useState } from "react";

const QubitFlowAnimation = ({ simulation, active, onAnimationComplete }) => {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    if (active) {
      setStartAnimation(true);
      const timeout = setTimeout(() => {
        setStartAnimation(false);
        if (onAnimationComplete) onAnimationComplete(); // notify parent
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [active, onAnimationComplete]);

  return (
    <div className="qubit-visualizer">
      {startAnimation ? (
        <div className="qubit-animation-track">
          <div className="stage sender">👤 {simulation.sender}</div>
          <div className="stage encrypt">🔒 Encrypting</div>
          <div className="tunnel">
            {[...(simulation.original_message || "")].map((char, i) => (
              <div
                key={i}
                className={`qubit ${simulation.eve_detected ? "glitch" : ""}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                ⚛️
              </div>
            ))}
          </div>
          <div className="stage decrypt">🔓 Decrypting</div>
          <div className="stage receiver">👤 {simulation.receiver}</div>
        </div>
      ) : (
        <div className="qubit-placeholder" />
      )}
    </div>
  );
};

export default QubitFlowAnimation;
