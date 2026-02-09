import { useState } from 'react';
import { Graph } from './lib';
import type { Microservice, GraphConfiguration } from './lib';
import mockData from './data/mockData.json';
import './App.css';

function App() {
  const [microservice] = useState<Microservice>(mockData.microservice as Microservice);

  // Example configuration with custom colors
  // If colors not specified, they fallback to grey (#9E9E9E)
  const configuration: GraphConfiguration = {
    colors: {
      microservice: '#7C4DFF', // Purple
      gateway: '#00BCD4',      // Cyan
      inbound: '#5C6BC0',      // Indigo
      outbound: '#26A69A'      // Teal
    }
  };

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
          configuration={configuration}
        />
      </main>

      <footer className="app-footer">
        <p>Click on elements to select • Hover for details • Export as SVG</p>
      </footer>
    </div>
  );
}

export default App;
