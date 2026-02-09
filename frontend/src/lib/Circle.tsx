import React from 'react';

export interface CircleTextLine {
  /** Text content */
  text: string;
  /** Font size */
  fontSize?: number;
  /** Font weight */
  fontWeight?: string | number;
  /** Y offset from center */
  yOffset?: number;
}

export interface CircleProps {
  /** Center X position */
  cx: number;
  /** Center Y position */
  cy: number;
  /** Circle radius */
  radius: number;
  /** Fill color */
  fill: string;
  /** Stroke color */
  stroke: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Single text line to display */
  text?: string;
  /** Multiple text lines to display (overrides text prop) */
  textLines?: CircleTextLine[];
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
  /** CSS class for the circle element */
  circleClassName?: string;
}

/**
 * Circle component for rendering microservice and gateway bubbles
 * Renders a circle with centered text (single or multiple lines)
 */
export const Circle: React.FC<CircleProps> = ({
  cx,
  cy,
  radius,
  fill,
  stroke,
  strokeWidth = 2,
  text,
  textLines,
  textColor = '#FFFFFF',
  maxTextLength = 12,
  opacity = 1,
  selected = false,
  hovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  className = '',
  circleClassName = ''
}) => {
  const actualStrokeWidth = selected ? strokeWidth + 1 : strokeWidth;
  const classes = `${className} ${selected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`.trim();

  const truncateText = (t: string, maxLen: number): string => {
    return t.length > maxLen ? t.slice(0, maxLen - 2) + '...' : t;
  };

  return (
    <g
      className={classes}
      style={{ opacity }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={testId}
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={actualStrokeWidth}
        className={circleClassName}
      />
      {textLines ? (
        // Render multiple text lines
        textLines.map((line, index) => (
          <text
            key={index}
            x={cx}
            y={cy + (line.yOffset ?? 0)}
            textAnchor="middle"
            fill={textColor}
            fontSize={line.fontSize ?? 12}
            fontWeight={line.fontWeight ?? 'normal'}
            className={`circle-text circle-text-${index}`}
          >
            {truncateText(line.text, maxTextLength)}
          </text>
        ))
      ) : text ? (
        // Render single text line
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill={textColor}
          fontSize="12"
          fontWeight="bold"
          className="circle-text"
        >
          {truncateText(text, maxTextLength)}
        </text>
      ) : null}
    </g>
  );
};

export default Circle;
