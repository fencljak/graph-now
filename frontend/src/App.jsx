import { useState } from 'react';
import { Graph } from './lib';
import mockData from './data/mockData.json';
import './App.css';

function App() {
  const [microservice] = useState(mockData.microservice);

  return (
    <div className="app" data-testid="app-container">
      <header className="app-header">
        <h1>Microservice Architecture Visualizer</h1>
        <p>Visualize how your microservice integrates with the outside world</p>
      </header>
      
      <main className="app-main">
        <Graph 
          microservice={microservice} 
          width={900} 
          height={900} 
        />
      </main>

      <footer className="app-footer">
        <p>Click on elements to select • Hover for details • Export as SVG</p>
      </footer>
    </div>
  );
}

export default App;
