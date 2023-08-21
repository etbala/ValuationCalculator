import './App.css';
import React, { useState } from 'react';
import Table from './components/Table';

function App() {
  const [error, setError] = useState("");
  return (
      <div className="App">
        <header className="App-header">
          <h1>Valuation Calculator</h1>
          {error && <div className="error-message">{error}</div>}
        </header>
        <main className="main-container">
          <Table setError={setError} />
        </main>
      </div>
  );
}

export default App;
