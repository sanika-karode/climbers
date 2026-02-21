import confetti from 'canvas-confetti';

function App() {
  function handleAnalyze() {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 } });
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">Climb</h1>
      </header>

      <section className="app-description">
        <p>
          Upload a photo of a climbing wall and we’ll analyze the route—finding holds and suggesting an optimal path so you can plan your climb.
        </p>
      </section>

      <footer className="app-upload">
        <div className="upload-container">
          <div className="upload-file-row">
            <label className="upload-label">Choose file</label>
            <input type="file" accept="image/*" aria-label="Upload climbing wall photo" />
          </div>
          <button type="button" className="upload-button" onClick={handleAnalyze}>
            Analyze Route
          </button>
        </div>
      </footer>

      <div className="route-display">
        <div className="route-path" />
        <div className="climber-dot" />
      </div>
    </div>
  );
}

export default App;