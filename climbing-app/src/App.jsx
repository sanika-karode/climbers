import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [holds, setHolds] = useState([]);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setError("");
    setHolds([]); // reset holds when new image uploaded

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle clicking on image
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHolds((prev) => [...prev, { x, y }]);
  };

  // Draw holds whenever they change
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  holds.forEach((hold, index) => {
    ctx.beginPath();
    ctx.arc(hold.x, hold.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#00ffcc";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "12px sans-serif";
    ctx.fillText(index + 1, hold.x - 4, hold.y - 12);
  });
}, [holds, image]);

  const undoLastHold = () => {
    setHolds((prev) => prev.slice(0, -1));
  };

  const clearHolds = () => {
    setHolds([]);
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">ClimbPath AI</h1>
      </header>

      <div className="app-description">
        <p>
          Upload a climbing wall image and click on each hold to mark its
          location. These coordinates will be used to generate an optimal
          climbing route.
        </p>
      </div>

      <div className="app-upload">
        <div className="upload-container">
          <div className="upload-file-row">
            <label className="upload-label">Upload Wall Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>

          {error && <p className="upload-error">{error}</p>}

          {holds.length > 0 && (
            <>
              <button className="upload-button" onClick={undoLastHold}>
                Undo Last Hold
              </button>
              <button className="upload-button" onClick={clearHolds}>
                Clear All Holds
              </button>
            </>
          )}
        </div>
      </div>

      {image && (
        <div className="route-result-wrapper">
          <p className="route-result-hint">
            Click on the image to mark climbing holds.
          </p>

          <div className="route-display route-result">
            <img
              ref={imageRef}
              src={image}
              alt="Climbing Wall"
              className="route-result-image"
            />

            <canvas
              ref={canvasRef}
              className="route-result-canvas route-result-canvas--clickable"
              onClick={handleCanvasClick}
            />
          </div>

          <p className="route-result-caption">
            {holds.length} holds selected
          </p>
        </div>
      )}
    </div>
  );
}

export default App;