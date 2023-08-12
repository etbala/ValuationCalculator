import './App.css';
import React, { useState } from 'react';
import Table from './components/Table';

/*

https://www.youtube.com/watch?v=bmpI252DmiI
https://www.youtube.com/watch?v=LMagNcngvcU
https://www.youtube.com/watch?v=xZZ6cCQxcmE

https://www.w3schools.com/html/html_form_input_types.asp

*/

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
