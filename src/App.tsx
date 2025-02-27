import React from 'react';
import Spreadsheet from './components/Spreadsheet/Spreadsheet';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <Spreadsheet />
      </ErrorBoundary>
    </div>
  );
}

export default App;
