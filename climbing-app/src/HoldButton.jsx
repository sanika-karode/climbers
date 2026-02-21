import { useMemo } from "react";
import "./HoldButton.css";

import hold1 from "./assets/hold1.png";
import hold2 from "./assets/hold2.png";
import hold3 from "./assets/hold3.png";
import hold4 from "./assets/hold4.png";

const holdImages = [hold1, hold2, hold3, hold4];

export default function HoldButton({ children, onClick, type = "button", compact = false, variant = 0 }) {
  const backgroundImage = useMemo(() => {
    const i = variant >= 0 && variant < holdImages.length ? variant : Math.floor(Math.random() * holdImages.length);
    return holdImages[i];
  }, [variant]);

  return (
    <button
      type={type}
      onClick={onClick || undefined}
      className={`hold-button ${compact ? "hold-button--compact" : ""}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <span className="hold-button-text">{children}</span>
    </button>
  );
}