import { useMemo } from "react";
import "./HoldButton.css";

const holdImages = [
  "/assets/hold1.png",
  "/assets/hold2.png",
  "/assets/hold3.png",
  "/assets/hold4.png",
];

export default function HoldButton({ children, onClick }) {
  const backgroundImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * holdImages.length);
    return holdImages[randomIndex];
  }, []);

  return (
    <button
      onClick={onClick}
      className="hold-button"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <span className="hold-text">{children}</span>
    </button>
  );
}