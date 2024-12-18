import './App.css';
import React, { useState } from 'react';
import Table from './components/Table';
import {isMobile} from 'react-device-detect';

function App() {
  const [error, setError] = useState("");

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
          <Table isMobile={isMobile} setError={setError} />
        </main>
      </div>
  );
}

export default App;
