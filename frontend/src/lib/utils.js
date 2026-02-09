/**
 * Calculate position on a circle given center, radius, and angle
 */
export const getPointOnCircle = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

/**
 * Calculate angle between two points in degrees
 */
export const getAngleBetweenPoints = (x1, y1, x2, y2) => {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
};

/**
 * Get edge point on a circle facing toward a target point
 * @returns {{x: number, y: number}} The plug point on the circle edge
 */
export const getCircleEdgePoint = (circleCenterX, circleCenterY, circleRadius, targetX, targetY) => {
  const angle = Math.atan2(targetY - circleCenterY, targetX - circleCenterX);
  return {
    x: circleCenterX + circleRadius * Math.cos(angle),
    y: circleCenterY + circleRadius * Math.sin(angle)
  };
};

/**
 * Get edge point on a rounded rectangle facing toward a target point
 * @returns {{x: number, y: number}} The plug point on the rectangle edge
 */
export const getRectEdgePoint = (rectCenterX, rectCenterY, rectWidth, rectHeight, targetX, targetY, cornerRadius = 8) => {
  const dx = targetX - rectCenterX;
  const dy = targetY - rectCenterY;
  
  if (dx === 0 && dy === 0) {
    return { x: rectCenterX, y: rectCenterY - rectHeight / 2 };
  }
  
  const halfWidth = rectWidth / 2;
  const halfHeight = rectHeight / 2;
  
  // Calculate intersection with rectangle edges
  const angle = Math.atan2(dy, dx);
  const tanAngle = Math.tan(angle);
  
  let edgeX, edgeY;
  
  // Check which edge we intersect
  if (Math.abs(dx) * halfHeight > Math.abs(dy) * halfWidth) {
    // Intersects left or right edge
    edgeX = dx > 0 ? halfWidth : -halfWidth;
    edgeY = edgeX * tanAngle;
  } else {
    // Intersects top or bottom edge
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
 * @param {string} hex - Hex color (e.g., '#7C4DFF')
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export const lightenColor = (hex, percent = 30) => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Lighten
  const lighten = (channel) => Math.min(255, Math.floor(channel + (255 - channel) * (percent / 100)));
  
  const newR = lighten(r).toString(16).padStart(2, '0');
  const newG = lighten(g).toString(16).padStart(2, '0');
  const newB = lighten(b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
};

/**
 * Generate color set (fill, stroke, text) from a base color
 * @param {string} baseColor - Base hex color
 * @returns {{fill: string, stroke: string, text: string}}
 */
export const generateColorSet = (baseColor) => {
  return {
    fill: baseColor,
    stroke: lightenColor(baseColor, 35),
    text: '#FFFFFF'
  };
};

/**
 * Generate bezier curve path between two points with control points
 */
export const generateBezierPath = (startX, startY, endX, endY, curvature = 0.3) => {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Calculate perpendicular offset for curve
  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.sqrt(dx * dx + dy * dy);
  
  if (len === 0) return `M ${startX} ${startY} L ${endX} ${endY}`;
  
  // Perpendicular direction
  const perpX = -dy / len;
  const perpY = dx / len;
  
  // Control point offset
  const offset = len * curvature;
  const ctrlX = midX + perpX * offset;
  const ctrlY = midY + perpY * offset;
  
  return `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
};

/**
 * Distribute items evenly on a circle arc
 */
export const distributeOnArc = (count, startAngle, endAngle) => {
  if (count === 0) return [];
  if (count === 1) return [(startAngle + endAngle) / 2];
  
  const angleStep = (endAngle - startAngle) / (count - 1);
  return Array.from({ length: count }, (_, i) => startAngle + i * angleStep);
};

/**
 * Calculate text width approximately
 */
export const estimateTextWidth = (text, fontSize = 12) => {
  return text.length * fontSize * 0.6;
};

/**
 * Download SVG as file
 */
export const downloadSvg = (svgElement, filename = 'microservice-graph.svg') => {
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
