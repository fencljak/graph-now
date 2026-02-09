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
 * Generate bezier curve path between two points with control points
 */
export const generateBezierPath = (startX, startY, endX, endY, curvature = 0.3) => {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Calculate perpendicular offset for curve
  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.sqrt(dx * dx + dy * dy);
  
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
