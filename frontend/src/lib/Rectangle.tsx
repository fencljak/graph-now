import React from 'react';

export interface RectangleProps {
  /** Center X position */
  x: number;
  /** Center Y position */
  y: number;
  /** Rectangle width */
  width: number;
  /** Rectangle height */
  height: number;
  /** Border radius */
  rx?: number;
  /** Border radius Y (defaults to rx) */
  ry?: number;
  /** Fill color */
  fill: string;
  /** Stroke color */
  stroke: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Text to display inside */
  text: string;
  /** Text color */
  textColor?: string;
  /** Maximum text length before truncation */
  maxTextLength?: number;
  /** Opacity (0-1) */
  opacity?: number;
  /** Whether the element is selected */
  selected?: boolean;
  /** Whether the element is hovered */
  hovered?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Mouse enter handler */
  onMouseEnter?: (e: React.MouseEvent) => void;
  /** Mouse leave handler */
  onMouseLeave?: () => void;
  /** Test ID for testing */
  testId?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Rectangle component for rendering endpoint bubbles (inbound/outbound)
 * Renders a rounded rectangle with centered text
 */
export const Rectangle: React.FC<RectangleProps> = ({
  x,
  y,
  width,
  height,
  rx = 8,
  ry,
  fill,
  stroke,
  strokeWidth = 2,
  text,
  textColor = '#FFFFFF',
  maxTextLength = 14,
  opacity = 1,
  selected = false,
  hovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  className = ''
}) => {
  const displayText = text.length > maxTextLength 
    ? text.slice(0, maxTextLength - 2) + '...' 
    : text;

  const actualStrokeWidth = selected ? strokeWidth + 1 : strokeWidth;
  const classes = `endpoint-group ${className} ${selected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`.trim();

  return (
    <g
      className={classes}
      style={{ opacity }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={testId}
    >
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={rx}
        ry={ry ?? rx}
        fill={fill}
        stroke={stroke}
        strokeWidth={actualStrokeWidth}
        className="endpoint-rect"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={textColor}
        fontSize="11"
        fontWeight="500"
        className="endpoint-text"
      >
        {displayText}
      </text>
    </g>
  );
};

export default Rectangle;
