import { useState, useRef, useEffect } from "react";
import "./App.css";

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

  const handleLogin = (user) => {
    setUser(user);
    setAuthUser(user);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthUser(null);
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (routeData) {
    return (
      <ResultPage
        image={routeData.image}
        holds={routeData.holds}
        onBack={() => setRouteData(null)}
      />
    );
  }

  return (
    <AnalyzePage
      user={user}
      onLogout={handleLogout}
      onAnalyze={(image, holds) =>
        setRouteData({ image, holds })
      }
    />
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
        <h1 className="app-title">ClimbPath AI</h1>
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
          Switch to {mode === "login" ? "Sign Up" : "Login"}
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

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHolds((prev) => [...prev, { x, y }]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    holds.forEach((hold, index) => {
      ctx.beginPath();
      ctx.arc(hold.x, hold.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#00ffcc";
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.fillText(index + 1, hold.x - 4, hold.y - 12);
    });
  }, [holds, image]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">ClimbPath AI</h1>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <div className="app-upload">
        <div className="upload-container">
          <input type="file" accept="image/*" onChange={handleImageUpload} />

          {error && <p className="upload-error">{error}</p>}

          {holds.length > 0 && (
            <>
              <button
                className="upload-button"
                onClick={() => setHolds((p) => p.slice(0, -1))}
              >
                Undo
              </button>

              <button
                className="upload-button"
                onClick={() => setHolds([])}
              >
                Clear
              </button>

              {/* 🔥 ANALYZE BUTTON */}
              {holds.length >= 2 && (
                <button
                  className="upload-button upload-button-primary"
                  onClick={() => onAnalyze(image, holds)}
                >
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
    </div>
  );
}

/* =========================
   RESULT PAGE (NEW)
========================= */

function ResultPage({ image, holds, onBack }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);

      // 🔥 DRAW LINE THROUGH ALL HOLDS
      if (holds.length >= 2) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.beginPath();

        ctx.moveTo(holds[0].x, holds[0].y);

        for (let i = 1; i < holds.length; i++) {
          ctx.lineTo(holds[i].x, holds[i].y);
        }

        ctx.stroke();
      }

      // Draw points
      holds.forEach((hold) => {
        ctx.beginPath();
        ctx.arc(hold.x, hold.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
      });
    };
  }, [image, holds]);

  return (
    <div className="app-layout">
      <h2>✨ This is the most optimized route ✨</h2>

      <canvas ref={canvasRef} />

      <button className="upload-button" onClick={onBack}>
        Back
      </button>
    </div>
  );
}