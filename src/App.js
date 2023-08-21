import './App.css';
import React, { useState } from 'react';
import Table from './components/Table';

function App() {
  const [error, setError] = useState("");
  return (
      <div className="App">
        <header className="App-header">
          <h1>Valuation Calculator</h1>
          <div className="error-message-container">
            <div className={`error-message ${error ? "visible" : ""}`}>
              {error}
            </div>
          </div>
        </header>
        <main className="main-container">
          <Table setError={setError} />
        </main>
        <footer>
            <div className="instructions">
              <p>
                Welcome to the Valuation Calculator! Follow these steps to use the tool:
              </p>
              <ul>
                <li>Type in a Ticker for a US publicly traded company in the Ticker box.</li>
                <li>Click the "Calculate" button to compute valuations using Yahoo Finance data.</li>
                <li>You can also input your own data in the boxes and click "Calculate" for your own valuations.</li>
                <li>To restore the Yahoo Finance data, simply click the "Restore" button.</li>
              </ul>
            </div>
        </footer>
      </div>
  );
}

export default App;
