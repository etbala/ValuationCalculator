import './App.css';
import React, { useState } from 'react';
import Table from './components/Table';

function App() {
  const [error, setError] = useState("");

  /*function isMobileDevice() {
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }*/
  
  /*if (isMobileDevice()) {
    document.documentElement.classList.add('mobile-device');
    setError("Mobile Device Detected.");
  } else {
    document.documentElement.classList.add('desktop-device');
  }*/

  return (
      <div className="App">
        <header className="App-header">
          <h1>Equity & Firm Valuation Calculator</h1>
          <div className="error-message-container">
            <div className={`error-message ${error ? "visible" : ""}`}>
              {error}
            </div>
          </div>
        </header>
        <main className="main-container">
          <Table setError={setError} />
        </main>
      </div>
  );
}

export default App;
