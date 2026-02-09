import { useState } from 'react';
import { Graph, Slider } from './lib';
import type { Microservice, GraphConfiguration } from './lib';
import mockData from './data/mockData.json';
import './App.css';

// Default ring gap configuration
const DEFAULT_RING_GAP = 90;
const MIN_RING_GAP = DEFAULT_RING_GAP;
const MAX_RING_GAP = DEFAULT_RING_GAP * 4;

function App() {
  const [microservice] = useState<Microservice>(mockData.microservice as Microservice);
  const [ringGap, setRingGap] = useState(DEFAULT_RING_GAP);

  // Configuration with custom colors and ring gap
  const configuration: GraphConfiguration = {
    colors: {
      microservice: '#7C4DFF', // Purple
      gateway: '#00BCD4',      // Cyan
      inbound: '#5C6BC0',      // Indigo
      outbound: '#26A69A'      // Teal
    },
    ringGap: {
      value: ringGap,
      min: MIN_RING_GAP,
      max: MAX_RING_GAP
    }
  };

  return (
    <div className="app" data-testid="app-container">
      <header className="app-header">
        <h1>Microservice Architecture Visualizer</h1>
        <p>Visualize how your microservice integrates with the outside world</p>
      </header>
      
      <main className="app-main">
        <div className="graph-controls">
          <Slider
            value={ringGap}
            min={MIN_RING_GAP}
            max={MAX_RING_GAP}
            step={5}
            label="Ring Gap"
            formatValue={(v) => `${v}px`}
            onChange={setRingGap}
            testId="ring-gap-slider"
          />
        </div>
        
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
