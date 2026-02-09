import React from 'react';
import { generateBezierPath } from './utils';

export interface EdgeProps {
  /** Start X position */
  startX: number;
  /** Start Y position */
  startY: number;
  /** End X position */
  endX: number;
  /** End Y position */
  endY: number;
  /** Stroke color */
  stroke: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Curvature of the bezier curve (0 = straight, higher = more curved) */
  curvature?: number;
  /** SVG marker ID for the start of the line */
  markerStart?: string;
  /** SVG marker ID for the end of the line (arrow) */
  markerEnd?: string;
  /** Opacity (0-1) */
  opacity?: number;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Edge component for rendering bezier curve connections between elements
 * Used for microservice-to-gateway and gateway-to-endpoint connections
 */
export const Edge: React.FC<EdgeProps> = ({
  startX,
  startY,
  endX,
  endY,
  stroke,
  strokeWidth = 2,
  curvature = 0.2,
  markerStart,
  markerEnd,
  opacity = 1,
  className = ''
}) => {
  const pathData = generateBezierPath(startX, startY, endX, endY, curvature);

  return (
    <path
      d={pathData}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      markerStart={markerStart ? `url(#${markerStart})` : undefined}
      markerEnd={markerEnd ? `url(#${markerEnd})` : undefined}
      className={`connection-line ${className}`.trim()}
      style={{ opacity }}
    />
  );
};

export default Edge;
