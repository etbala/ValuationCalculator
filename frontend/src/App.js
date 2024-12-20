import './App.css';
import React, { useState } from 'react';
import Table from './components/Table';

function App() {
  const [error, setError] = useState("");

  return (
      <div className="App">
        <header className="App-header">
          <h1 id="main-header">Equity & Firm Valuation Calculator</h1>
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
