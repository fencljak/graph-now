import type { Position, ColorSet, RectPosition } from './types';

/**
 * Calculate position on a circle given center, radius, and angle
 */
export const getPointOnCircle = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Position => {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

/**
 * Calculate angle between two points in degrees
 */
export const getAngleBetweenPoints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
};

/**
 * Get edge point on a circle facing toward a target point
 */
export const getCircleEdgePoint = (
  circleCenterX: number,
  circleCenterY: number,
  circleRadius: number,
  targetX: number,
  targetY: number
): Position => {
  const angle = Math.atan2(targetY - circleCenterY, targetX - circleCenterX);
  return {
    x: circleCenterX + circleRadius * Math.cos(angle),
    y: circleCenterY + circleRadius * Math.sin(angle)
  };
};

/**
 * Get edge point on a rounded rectangle facing toward a target point
 */
export const getRectEdgePoint = (
  rectCenterX: number,
  rectCenterY: number,
  rectWidth: number,
  rectHeight: number,
  targetX: number,
  targetY: number
): Position => {
  const dx = targetX - rectCenterX;
  const dy = targetY - rectCenterY;
  
  if (dx === 0 && dy === 0) {
    return { x: rectCenterX, y: rectCenterY - rectHeight / 2 };
  }
  
  const halfWidth = rectWidth / 2;
  const halfHeight = rectHeight / 2;
  
  const angle = Math.atan2(dy, dx);
  const tanAngle = Math.tan(angle);
  
  let edgeX: number;
  let edgeY: number;
  
  if (Math.abs(dx) * halfHeight > Math.abs(dy) * halfWidth) {
    edgeX = dx > 0 ? halfWidth : -halfWidth;
    edgeY = edgeX * tanAngle;
  } else {
    edgeY = dy > 0 ? halfHeight : -halfHeight;
    edgeX = edgeY / tanAngle;
  }
  
  return {
    x: rectCenterX + edgeX,
    y: rectCenterY + edgeY
  };
};

/**
 * Lighten a hex color by a percentage
 */
export const lightenColor = (hex: string, percent: number = 30): string => {
  const cleanHex = hex.replace('#', '');
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  const lighten = (channel: number): number => 
    Math.min(255, Math.floor(channel + (255 - channel) * (percent / 100)));
  
  const newR = lighten(r).toString(16).padStart(2, '0');
  const newG = lighten(g).toString(16).padStart(2, '0');
  const newB = lighten(b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
};

/**
 * Generate color set (fill, stroke, text) from a base color
 */
export const generateColorSet = (baseColor: string): ColorSet => {
  return {
    fill: baseColor,
    stroke: lightenColor(baseColor, 35),
    text: '#FFFFFF'
  };
};

/**
 * Generate bezier curve path between two points with control points
 */
export const generateBezierPath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  curvature: number = 0.3
): string => {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.sqrt(dx * dx + dy * dy);
  
  if (len === 0) return `M ${startX} ${startY} L ${endX} ${endY}`;
  
  const perpX = -dy / len;
  const perpY = dx / len;
  
  const offset = len * curvature;
  const ctrlX = midX + perpX * offset;
  const ctrlY = midY + perpY * offset;
  
  return `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
};

/**
 * Distribute items evenly on a circle arc
 */
export const distributeOnArc = (
  count: number,
  startAngle: number,
  endAngle: number
): number[] => {
  if (count === 0) return [];
  if (count === 1) return [(startAngle + endAngle) / 2];
  
  const angleStep = (endAngle - startAngle) / (count - 1);
  return Array.from({ length: count }, (_, i) => startAngle + i * angleStep);
};

/**
 * Estimate text width approximately
 */
export const estimateTextWidth = (text: string, fontSize: number = 12): number => {
  return text.length * fontSize * 0.6;
};

/**
 * Download SVG element as file
 */
export const downloadSvg = (
  svgElement: SVGSVGElement,
  filename: string = 'microservice-graph.svg'
): void => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  
  const downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(svgUrl);
};

/**
 * Check if two rectangles collide (AABB collision detection)
 */
export const rectsCollide = (rect1: RectPosition, rect2: RectPosition): boolean => {
  return !(
    rect1.bottomRight.x < rect2.topLeft.x ||
    rect2.bottomRight.x < rect1.topLeft.x ||
    rect1.bottomRight.y < rect2.topLeft.y ||
    rect2.bottomRight.y < rect1.topLeft.y
  );
};
