import React from 'react';

export interface RingProps {
  /** Center X position */
  cx: number;
  /** Center Y position */
  cy: number;
  /** Ring radius */
  radius: number;
  /** Stroke color */
  stroke?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Stroke dash array (e.g., "4 4" for dashed line) */
  strokeDasharray?: string;
  /** Opacity (0-1) */
  opacity?: number;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Ring component for rendering reference circles
 * Used to show the circular layout guides for gateways and endpoints
 */
export const Ring: React.FC<RingProps> = ({
  cx,
  cy,
  radius,
  stroke = '#e0e0e0',
  strokeWidth = 1,
  strokeDasharray = '4 4',
  opacity = 1,
  className = ''
}) => {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      className={`reference-ring ${className}`.trim()}
      style={{ opacity }}
    />
  );
};

export default Ring;
