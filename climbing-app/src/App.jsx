import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
          holdType={routeData.holdType}
          leftHoldIndex={routeData.leftHoldIndex}
          rightHoldIndex={routeData.rightHoldIndex}
          route={routeData.route}
          totalCost={routeData.total_cost}
          estimatedGrade={routeData.estimated_grade}
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
        <p className="home-tagline">just keep climbing</p>
      </header>

      <div className="home-steps">
        <div className="home-step-box">
          <div className="home-step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <p className="home-step-text">Take a photo</p>
        </div>
        <div className="home-step-box">
          <div className="home-step-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" />
            </svg>
          </div>
          <p className="home-step-text">Set your holds</p>
        </div>
        <div className="home-step-box">
          <div className="home-step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="home-step-text">Climb!</p>
        </div>
      </div>

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
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = getUsers();

    if (mode === "signup") {
      if (users.find((u) => u.email === email)) {
        setError("User already exists");
        return;
      }

      if (!height || !armSpan || !level) {
        setError("Please enter height, arm span, and level");
        return;
      }

      const newUser = {
        email,
        password,
        height,
        armSpan,
        level,
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
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Arm Span (cm)"
              value={armSpan}
              onChange={(e) => setArmSpan(e.target.value)}
              required
            />

            <select
              className="auth-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
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
   HOLD TYPES (for backend)
========================= */

const HOLD_TYPES = ["jug", "crimp", "sloper", "pinch"];
const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000";

/* =========================
   ANALYZE PAGE
========================= */

function AnalyzePage({ user, onLogout, onAnalyze }) {
  const [image, setImage] = useState(null);
  const [holdType, setHoldType] = useState("one_hand");
  const [leftHold, setLeftHold] = useState(null);
  const [rightHold, setRightHold] = useState(null);
  const [restHolds, setRestHolds] = useState([]);
  const [scaleStart, setScaleStart] = useState(null);
  const [scaleEnd, setScaleEnd] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image.");
      return;
    }

    setError("");
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

    const hold = { ...point, holdType: "jug" };
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
    ? (() => {
        const startPair = [leftHold, rightHold].filter(Boolean);
        if (startPair.length === 2) {
          const [leftMost, rightMost] = [...startPair].sort((a, b) => a.x - b.x);
          return [leftMost, rightMost, ...restHolds];
        }
        return [leftHold, rightHold, ...restHolds].filter(Boolean);
      })()
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
    if (index === 0) return "start";
    return `hold ${index}`;
  };

  const handleUpdateHoldType = (index, newHoldType) => {
    if (holdType === "two_hand") {
      if (index === 0) {
        if (leftHold && rightHold) {
          (leftHold.x <= rightHold.x ? setLeftHold : setRightHold)((h) => (h ? { ...h, holdType: newHoldType } : null));
        } else {
          setLeftHold((h) => (h ? { ...h, holdType: newHoldType } : null));
        }
      } else if (index === 1) {
        if (leftHold && rightHold) {
          (leftHold.x <= rightHold.x ? setRightHold : setLeftHold)((h) => (h ? { ...h, holdType: newHoldType } : null));
        } else {
          setRightHold((h) => (h ? { ...h, holdType: newHoldType } : null));
        }
      } else {
        setRestHolds((prev) => prev.map((h, i) => (i === index - 2 ? { ...h, holdType: newHoldType } : h)));
      }
    } else {
      setRestHolds((prev) => prev.map((h, i) => (i === index ? { ...h, holdType: newHoldType } : h)));
    }
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

  const handleAnalyze = async () => {
    if (!canAnalyze || !image) return;
    setLoading(true);
    setError("");
    try {
      const scaleDeltaY = Math.abs((scaleEnd?.y ?? 0) - (scaleStart?.y ?? 0));
      const calibration_20cm_y = scaleDeltaY > 0 ? scaleDeltaY : 0.05;

      const apiHolds = holds.map((h, i) => ({
        id: i + 1,
        x: h.x,
        y: h.y,
        hold_type: h.holdType || "jug",
        role: holdType === "two_hand"
          ? i === 0 || i === 1
            ? "start"
            : i === holds.length - 1
              ? "end"
              : "middle"
          : i === 0
            ? "start"
            : i === holds.length - 1
              ? "end"
              : "middle",
      }));

      const startLeft = holdType === "two_hand" ? 1 : 1;
      const startRight = holdType === "two_hand" ? 2 : 1;
      const endId = apiHolds.length;

      const payload = {
        wall: {
          holds: apiHolds,
          calibration_20cm_y,
        },
        climber: {
          height: parseFloat(user.height) || 170,
          experience: user.level || "intermediate",
          arm_span: parseFloat(user.armSpan) || 170,
        },
        start_left_hold_id: startLeft,
        start_right_hold_id: startRight,
        end_hold_id: endId,
      };

      const res = await fetch(`${API_BASE}/api/v1/generate-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to generate route");

      onAnalyze({
        image,
        holdType,
        holds,
        leftHoldIndex: holdType === "two_hand" ? 0 : 0,
        rightHoldIndex: holdType === "two_hand" ? 1 : 0,
        scaleOneFoot: { start: scaleStart, end: scaleEnd },
        route: data.route,
        total_cost: data.total_cost,
        estimated_grade: data.estimated_grade,
      });
    } catch (err) {
      setError(err.message || "Failed to generate route");
    } finally {
      setLoading(false);
    }
  };

  const handleClearScale = () => {
    setScaleStart(null);
    setScaleEnd(null);
  };

  const getInstruction = () => {
    if (!image) return null;
    if (!scaleStart) return "click the first point to set the 20 cm scale";
    if (!scaleEnd) return "click the second point to complete the 20 cm scale";
    if (holdType === "two_hand") {
      if (!leftHold) return "click on the image to place your LEFT starting hold";
      if (!rightHold) return "click on the image to place your RIGHT starting hold";
      return "click to add the remaining holds in climb order";
    }
    if (restHolds.length === 0) return "click to place your START hold";
    return "click to add the next hold in climb order";
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
        ctx.fillText("20 cm", (sx + ex) / 2 - 18, (sy + ey) / 2 - 8);
      }
    }

    holds.forEach((hold, index) => {
      const px = hold.x * canvas.width;
      const py = hold.y * canvas.height;
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(index + 1), px, py);
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
                Clear 20 cm scale
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

              {holds.length > 0 && (
                <div className="hold-type-list">
                  <span className="hold-type-list-title">Hold types</span>
                  {holds.map((hold, index) => (
                    <div key={index} className="hold-type-row">
                      <span className="hold-type-label-text">{getHoldLabel(index)}</span>
                      <select
                        className="hold-type-select hold-type-select-small"
                        value={hold.holdType || "jug"}
                        onChange={(e) => handleUpdateHoldType(index, e.target.value)}
                      >
                        {HOLD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
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
                  disabled={loading}
                >
                  {loading ? "Generating route…" : "Analyze Route"}
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

function ResultPage({ image, holds, holdType, leftHoldIndex, rightHoldIndex, route, totalCost, estimatedGrade, onBack }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const getPosByHoldId = useCallback((holdId) => {
    const idx = holdId - 1;
    if (idx < 0 || idx >= holds.length) return null;
    return holds[idx];
  }, [holds]);

  const holdColorByHand = useMemo(() => {
    const map = {};
    const startLeftId = leftHoldIndex + 1;
    const startRightId = rightHoldIndex + 1;
    map[startLeftId] = "left";
    map[startRightId] = "right";
    if (route && Array.isArray(route)) {
      route.forEach((step) => {
        map[step.to_hold] = step.moved_limb === "left_hand" ? "left" : "right";
      });
    }
    return map;
  }, [route, leftHoldIndex, rightHoldIndex]);

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

    if (route && route.length > 0) {
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      route.forEach((step) => {
        ctx.strokeStyle = step.moved_limb === "left_hand" ? "#3b82f6" : "#ef4444";
        const fromH = getPosByHoldId(step.from_hold);
        const toH = getPosByHoldId(step.to_hold);
        if (fromH && toH) {
          const p1 = toCanvas(fromH.x, fromH.y);
          const p2 = toCanvas(toH.x, toH.y);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    }

    holds.forEach((h, i) => {
      const holdId = i + 1;
      const { x, y } = toCanvas(h.x, h.y);
      const hand = holdColorByHand[holdId];
      ctx.fillStyle = hand === "left" ? "#3b82f6" : hand === "right" ? "#ef4444" : "#eab308";
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(holdId), x, y);
    });
  }, [image, holds, route, holdColorByHand, getPosByHoldId]);

  useEffect(() => {
    const ro = new ResizeObserver(drawResult);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [drawResult]);

  useEffect(() => {
    if (imgLoaded) drawResult();
  }, [imgLoaded, drawResult]);

  return (
    <div className="app-layout">
      <h2 className="result-page-title">Optimized route</h2>
      {estimatedGrade && (
        <p className="result-meta">Grade: {estimatedGrade}</p>
      )}
      {route && route.length > 0 && (
        <div className="route-steps">
          <h3>Route sequence</h3>
          <ol className="route-steps-list">
            {route.map((step, i) => (
              <li key={i}>
                Step {step.step_number}: {step.moved_limb} → hold {step.to_hold}
                {step.move_type && ` (${step.move_type})`}
              </li>
            ))}
          </ol>
        </div>
      )}
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