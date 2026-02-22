import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";
import appBackground from "./assets/appBackground.png";

/* =========================
   AUTH STORAGE
========================= */

const USERS_KEY = "climbpath_users";
const AUTH_KEY = "climbpath_auth";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getAuthUser() {
  return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
}

function setAuthUser(user) {
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_KEY);
}

/* =========================
   APP
========================= */

export default function App() {
  const [user, setUser] = useState(getAuthUser());
  const [routeData, setRouteData] = useState(null);
  const [showHome, setShowHome] = useState(true);

  const handleLogin = (user) => {
    setUser(user);
    setAuthUser(user);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthUser(null);
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
          onBack={() => setRouteData(null)}
        />
      )}
      {user && !routeData && (
        <AnalyzePage
          user={user}
          onLogout={handleLogout}
          onAnalyze={(image, holds) =>
            setRouteData({ image, holds })
          }
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

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [height, setHeight] = useState("");
  const [armSpan, setArmSpan] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = getUsers();

    if (mode === "signup") {
      if (users.find((u) => u.email === email)) {
        setError("User already exists");
        return;
      }

      if (!height || !armSpan) {
        setError("Please enter height and arm span");
        return;
      }

      const newUser = {
        email,
        password,
        height,
        armSpan,
      };

      users.push(newUser);
      saveUsers(users);
      onLogin(newUser);
    }

    if (mode === "login") {
      const found = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!found) {
        setError("Invalid login");
        return;
      }

      onLogin(found);
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

        {/* ✅ HEIGHT + ARM SPAN ONLY FOR SIGNUP */}
        {mode === "signup" && (
          <>
            <input
              type="text"
              placeholder="Height (e.g. 5'10)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Arm Span (e.g. 6'0)"
              value={armSpan}
              onChange={(e) => setArmSpan(e.target.value)}
              required
            />
          </>
        )}

        {error && <p className="upload-error">{error}</p>}

        <button type="submit" className="upload-button">
          {mode === "login" ? "Login" : "Sign Up"}
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
  const [holds, setHolds] = useState([]);
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
    setHolds([]);

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const xNorm = (e.clientX - rect.left) / rect.width;
    const yNorm = (e.clientY - rect.top) / rect.height;
    setHolds((prev) => [...prev, { x: xNorm, y: yNorm }]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    holds.forEach((hold, index) => {
      const px = hold.x * canvas.width;
      const py = hold.y * canvas.height;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#00ffcc";
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "12px sans-serif";
      ctx.fillText(index + 1, px - 4, py - 12);
    });
  }, [holds, image]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">ASCEND</h1>
      </header>

      <div className="app-upload">
        <div className="upload-container">
          <input type="file" accept="image/*" onChange={handleImageUpload} />

          {error && <p className="upload-error">{error}</p>}

          {holds.length > 0 && (
            <>
              <button type="button" className="upload-button" onClick={() => setHolds((p) => p.slice(0, -1))}>
                Undo
              </button>

              <button type="button" className="upload-button" onClick={() => setHolds([])}>
                Clear
              </button>

              {holds.length >= 2 && (
                <button type="button" className="upload-button upload-button-primary" onClick={() => onAnalyze(image, holds)}>
                  Analyze Route
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {image && (
        <div className="route-result-wrapper">
          <div className="route-display route-result">
            <img
              src={image}
              alt="Wall"
              className="route-result-image"
            />

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

function ResultPage({ image, holds, onBack }) {
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
      <h2 className="result-page-title">✨ This is the most optimized route ✨</h2>

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