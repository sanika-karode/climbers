function App() {
  return (
    <>
      <h1 className="app-title">
        Climb
      </h1>

      <div className="upload-container">
        <p>Upload your climbing wall image</p>

        <input type="file" accept="image/*" />

        <br />

        <button className="upload-button">
          Analyze Route
        </button>
      </div>

      <div className="route-display">
        <div className="route-path" />
        <div className="climber-dot" />
      </div>
    </>
  );
}

export default App;