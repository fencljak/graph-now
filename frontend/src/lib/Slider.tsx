import React from 'react';
import './Slider.css';

export interface SliderProps {
  /** Current value */
  value: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
  /** Label to display */
  label?: string;
  /** Whether to show the current value */
  showValue?: boolean;
  /** Value formatter for display */
  formatValue?: (value: number) => string;
  /** Change handler */
  onChange: (value: number) => void;
  /** Additional CSS class names */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * Slider component for controlling numeric values
 * Used for adjusting ring gap distances in the graph
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  showValue = true,
  formatValue = (v) => v.toString(),
  onChange,
  className = '',
  testId
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  // Calculate percentage for styling the track fill
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`slider-container ${className}`.trim()} data-testid={testId}>
      {label && (
        <label className="slider-label">
          {label}
          {showValue && <span className="slider-value">{formatValue(value)}</span>}
        </label>
      )}
      <div className="slider-wrapper">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="slider-input"
          style={{
            background: `linear-gradient(to right, #667eea 0%, #764ba2 ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`
          }}
        />
        <div className="slider-ticks">
          <span className="slider-tick-label">{formatValue(min)}</span>
          <span className="slider-tick-label">{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
};

export default Slider;
