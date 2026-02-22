import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";
import appBackground from "./assets/appBackground.png";

/* =========================
   AUTH STORAGE (Backend JWT)
========================= */

const AUTH_KEY = "climbpath_auth";
// In dev, use empty string so Vite proxy forwards to backend (avoids CORS)
const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "http://localhost:8000");

function getAuthUser() {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

function setAuthUser(authResponse) {
  if (authResponse?.access_token) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authResponse));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

/* =========================
   APP
========================= */

export default function App() {
  const [user, setUser] = useState(getAuthUser());
  const [routeData, setRouteData] = useState(null);
  const [showHome, setShowHome] = useState(!getAuthUser());

  const handleLogin = (authResponse) => {
    setUser(authResponse);
    setAuthUser(authResponse);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthUser(null);
    setRouteData(null);
    setShowHome(false);
  };

  return (
    <>
      <div className="app-background" style={{ backgroundImage: `url(${appBackground})` }} aria-hidden />
      {showHome && !user && <HomePage onGetStarted={() => setShowHome(false)} />}
      {!showHome && !user && <AuthPage onLogin={handleLogin} />}
      {user && routeData && (
        <ResultPage
          image={routeData.image}
          holds={routeData.holds}
          holdType={routeData.holdType}
          leftHoldIndex={routeData.leftHoldIndex}
          rightHoldIndex={routeData.rightHoldIndex}
          onBack={() => setRouteData(null)}
        />
      )}
      {user && !routeData && (
        <AnalyzePage
          user={user}
          onLogout={handleLogout}
          onAnalyze={(routeData) => setRouteData(routeData)}
        />
      )}
    </>
  );
}

/* =========================
   HOME PAGE
========================= */

function HomePage({ onGetStarted }) {
  return (
    <div className="app-layout home-page">
      <header className="app-header">
        <h1 className="app-title">ASCEND</h1>
      </header>

      <p className="home-tagline">just keep climbing</p>

      <p className="home-description">
        <p>Climb a problem in 3 easy steps.<br />1. Take a photo<br />2. Set your holds<br />3. Climb!</p>
      </p>

      <div className="home-actions">
        <button type="button" className="upload-button" onClick={onGetStarted}>
          Get Started Now
        </button>
      </div>
    </div>
  );
}

/* =========================
   AUTH PAGE
========================= */

/** Parse height/arm span: "5'10" -> 70, or "70" -> 70 */
function parseInches(value) {
  if (!value || typeof value !== "string") return 0;
  const v = value.trim();
  const match = v.match(/^(\d+)\s*[''']\s*(\d+)$/);
  if (match) return parseFloat(match[1]) * 12 + parseFloat(match[2]);
  return parseFloat(v) || 0;
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [height, setHeight] = useState("");
  const [armSpan, setArmSpan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const username = email.trim();
      if (!username || !password) {
        setError("Email and password are required");
        return;
      }

      if (mode === "signup") {
        const heightNum = parseInches(height);
        const armSpanNum = parseInches(armSpan);
        if (!heightNum || !armSpanNum) {
          setError("Please enter height and arm span (e.g. 70 or 5'10)");
          return;
        }

        const regRes = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
            height: heightNum,
            armspan: armSpanNum,
            experience: "beginner",
          }),
        });

        if (!regRes.ok) {
          const text = await regRes.text();
          let err = {};
          try {
            err = JSON.parse(text);
          } catch (_) {}
          let msg = "Registration failed";
          if (err.detail) {
            msg = Array.isArray(err.detail)
              ? err.detail.map((e) => e.msg || JSON.stringify(e)).join("; ")
              : String(err.detail);
          } else if (regRes.status === 422) {
            msg = "Invalid input (check email, password, height, arm span)";
          } else {
            const preview = text.slice(0, 200).replace(/\s+/g, " ").trim();
            msg = `Registration failed (${regRes.status}): ${preview || "See backend console for details"}`;
          }
          throw new Error(msg);
        }

        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!loginRes.ok) throw new Error("Account created but login failed");
        const data = await loginRes.json();
        onLogin(data);
      } else {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!loginRes.ok) {
          const err = await loginRes.json().catch(() => ({}));
          const msg = Array.isArray(err.detail)
            ? err.detail.map((e) => e.msg).join("; ")
            : (err.detail || "Invalid credentials");
          throw new Error(msg);
        }

        const data = await loginRes.json();
        onLogin(data);
      }
    } catch (err) {
      const msg = err.message || "Something went wrong";
      if (msg === "Failed to fetch" || msg.includes("Load failed") || err.name === "TypeError") {
        setError("Cannot connect to server. Make sure the backend is running: cd backend && uvicorn app.main:app --reload --port 8000");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">ASCEND</h1>
      </header>

      <form className="upload-container" onSubmit={handleSubmit}>
        <h2>{mode === "login" ? "Log In" : "Sign Up"}</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {mode === "signup" && (
          <>
            <input
              type="text"
              placeholder="Height (e.g. 70 or 5'10)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Arm span (e.g. 72 or 6'0)"
              value={armSpan}
              onChange={(e) => setArmSpan(e.target.value)}
              required
            />
          </>
        )}

        {error && <p className="upload-error">{error}</p>}

        <button type="submit" className="upload-button" disabled={loading}>
          {loading ? "..." : mode === "login" ? "Login" : "Sign Up"}
        </button>

        <button
          type="button"
          className="upload-button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Sign Up" : "Login"}
        </button>
      </form>
    </div>
  );
}

/* =========================
   ANALYZE PAGE
========================= */

function AnalyzePage({ user, onLogout, onAnalyze }) {
  const [image, setImage] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [holdType, setHoldType] = useState("one_hand");
  const [leftHold, setLeftHold] = useState(null);
  const [rightHold, setRightHold] = useState(null);
  const [restHolds, setRestHolds] = useState([]);
  const [scaleStart, setScaleStart] = useState(null);
  const [scaleEnd, setScaleEnd] = useState(null);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image.");
      return;
    }

    setError("");
    setRawFile(file);
    setLeftHold(null);
    setRightHold(null);
    setRestHolds([]);
    setScaleStart(null);
    setScaleEnd(null);

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleHoldTypeChange = (e) => {
    const value = e.target.value;
    setHoldType(value);
    setLeftHold(null);
    setRightHold(null);
    setRestHolds([]);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const xNorm = (e.clientX - rect.left) / rect.width;
    const yNorm = (e.clientY - rect.top) / rect.height;
    const point = { x: xNorm, y: yNorm };

    if (!scaleStart) {
      setScaleStart(point);
      return;
    }
    if (!scaleEnd) {
      setScaleEnd(point);
      return;
    }

    const hold = point;
    if (holdType === "two_hand") {
      if (!leftHold) {
        setLeftHold(hold);
      } else if (!rightHold) {
        setRightHold(hold);
      } else {
        setRestHolds((prev) => [...prev, hold]);
      }
    } else {
      setRestHolds((prev) => [...prev, hold]);
    }
  };

  const holds = holdType === "two_hand"
    ? [leftHold, rightHold, ...restHolds].filter(Boolean)
    : restHolds;

  const canAnalyze =
    scaleStart &&
    scaleEnd &&
    holds.length >= 2 &&
    (holdType === "one_hand" || (leftHold && rightHold));

  const getHoldLabel = (index) => {
    if (holdType === "two_hand") {
      if (index === 0) return "L";
      if (index === 1) return "R";
      return String(index - 1);
    }
    return String(index + 1);
  };

  const handleUndo = () => {
    const lastIndex = holds.length - 1;
    if (lastIndex < 0) return;

    if (holdType === "two_hand") {
      if (restHolds.length > 0) {
        setRestHolds((p) => p.slice(0, -1));
      } else if (rightHold) {
        setRightHold(null);
      } else if (leftHold) {
        setLeftHold(null);
      }
    } else {
      if (restHolds.length > 0) setRestHolds((p) => p.slice(0, -1));
    }
  };

  const handleClear = () => {
    setLeftHold(null);
    setRightHold(null);
    setRestHolds([]);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleAnalyze = async () => {
    if (!canAnalyze || !image || !rawFile || !user?.access_token) return;
    setIsUploading(true);
    setError("");

    try {
      const holdsData = holds.map((h) => ({
        x_position: h.x,
        y_position: h.y,
        hold_type: "unknown",
      }));

      const formData = new FormData();
      formData.append("file", rawFile);
      formData.append("holds_data", JSON.stringify(holdsData));

      const res = await fetch(`${API_BASE}/api/v1/walls/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access_token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }

      onAnalyze({
        image,
        holdType,
        holds,
        leftHoldIndex: holdType === "two_hand" ? 0 : undefined,
        rightHoldIndex: holdType === "two_hand" ? 1 : undefined,
        scaleOneFoot: { start: scaleStart, end: scaleEnd },
      });
    } catch (err) {
      const msg = err.message || "Failed to save wall data";
      if (msg === "Failed to fetch" || msg.includes("Load failed") || err.name === "TypeError") {
        setError("Cannot connect to server. Is the backend running? (uvicorn app.main:app --reload --port 8000)");
      } else {
        setError(msg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearScale = () => {
    setScaleStart(null);
    setScaleEnd(null);
  };

  const getInstruction = () => {
    if (!image) return null;
    if (!scaleStart) return "click the first point to set the 1-foot scale";
    if (!scaleEnd) return "click the second point to complete the 1-foot scale";
    if (holdType === "two_hand") {
      if (!leftHold) return "click on the image to place your LEFT starting hold";
      if (!rightHold) return "click on the image to place your RIGHT starting hold";
      return "click to add the remaining holds in climb order";
    }
    return "click to add holds in climb order";
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (scaleStart) {
      const sx = scaleStart.x * canvas.width;
      const sy = scaleStart.y * canvas.height;
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      if (scaleEnd) {
        const ex = scaleEnd.x * canvas.width;
        const ey = scaleEnd.y * canvas.height;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ex, ey, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "10px sans-serif";
        ctx.fillText("1 ft", (sx + ex) / 2 - 12, (sy + ey) / 2 - 8);
      }
    }

    holds.forEach((hold, index) => {
      const px = hold.x * canvas.width;
      const py = hold.y * canvas.height;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#00ffcc";
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "12px sans-serif";
      ctx.fillText(getHoldLabel(index), px - 4, py - 12);
    });
  }, [holds, image, holdType, scaleStart, scaleEnd]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">ASCEND</h1>
      </header>

      <div className="app-upload">
        <div className="upload-container">
          <input type="file" accept="image/*" onChange={handleImageUpload} />

          {image && !scaleEnd && getInstruction() && (
            <p className="hold-instruction">{getInstruction()}</p>
          )}

          {image && scaleStart && scaleEnd && (
            <>
              <button type="button" className="upload-button" onClick={handleClearScale}>
                Clear 1-foot scale
              </button>

              <label className="hold-type-label">
                hold type
                <select
                  className="hold-type-select"
                  value={holdType}
                  onChange={handleHoldTypeChange}
                >
                  <option value="one_hand">one hand hold</option>
                  <option value="two_hand">two hand hold</option>
                </select>
              </label>

              <p className="hold-instruction">{getInstruction()}</p>
            </>
          )}

          {error && <p className="upload-error">{error}</p>}

          {scaleStart && scaleEnd && holds.length > 0 && (
            <>
              <button type="button" className="upload-button" onClick={handleUndo}>
                Undo
              </button>

              <button type="button" className="upload-button" onClick={handleClear}>
                Clear
              </button>

              {canAnalyze && (
                <button
                  type="button"
                  className="upload-button upload-button-primary"
                  onClick={handleAnalyze}
                  disabled={isUploading}
                >
                  {isUploading ? "Saving..." : "Analyze Route"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {image && (
        <div className="route-result-wrapper">
          <div className="route-display route-result">
            <img src={image} alt="Wall" className="route-result-image" />
            <canvas
              ref={canvasRef}
              className="route-result-canvas route-result-canvas--clickable"
              onClick={handleCanvasClick}
            />
          </div>
        </div>
      )}

      <div className="logout-footer">
        <button type="button" className="upload-button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}

/* =========================
   RESULT PAGE (NEW)
========================= */

function ResultPage({ image, holds, holdType, leftHoldIndex, rightHoldIndex, onBack }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cw = rect.width;
    const ch = rect.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.min(cw / iw, ch / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const offsetX = (cw - drawW) / 2;
    const offsetY = (ch - drawH) / 2;

    const toCanvas = (x, y) => ({
      x: x * drawW + offsetX,
      y: y * drawH + offsetY,
    });

    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);

    if (holds.length >= 2) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const first = toCanvas(holds[0].x, holds[0].y);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < holds.length; i++) {
        const p = toCanvas(holds[i].x, holds[i].y);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    holds.forEach((h) => {
      const { x, y } = toCanvas(h.x, h.y);
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [image, holds, imgLoaded]);

  const drawResult = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cw = rect.width;
    const ch = rect.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.min(cw / iw, ch / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const offsetX = (cw - drawW) / 2;
    const offsetY = (ch - drawH) / 2;
    const toCanvas = (x, y) => ({ x: x * drawW + offsetX, y: y * drawH + offsetY });
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);
    if (holds.length >= 2) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const first = toCanvas(holds[0].x, holds[0].y);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < holds.length; i++) {
        const p = toCanvas(holds[i].x, holds[i].y);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    holds.forEach((h) => {
      const { x, y } = toCanvas(h.x, h.y);
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [image, holds]);

  useEffect(() => {
    const ro = new ResizeObserver(drawResult);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [drawResult]);

  return (
    <div className="app-layout">
      <h2 className="result-page-title"><p></p><p></p>This is the most optimized route </h2>

      <div className="route-result-wrapper">
        <div className="route-display route-result" ref={containerRef}>
          <img ref={imgRef} src={image} alt="Wall" className="route-result-image" onLoad={() => setImgLoaded(true)} />
          <canvas ref={canvasRef} className="route-result-canvas" aria-hidden />
        </div>
      </div>

      <div className="result-actions">
        <button type="button" className="upload-button" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}