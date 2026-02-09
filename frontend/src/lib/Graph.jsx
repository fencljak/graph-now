import React, { useRef, useState, useMemo, useCallback } from 'react';
import { COLORS } from './colors';
import { getPointOnCircle, generateBezierPath, distributeOnArc, estimateTextWidth, downloadSvg } from './utils';
import './Graph.css';

/**
 * MicroserviceGraph - SVG visualization component for microservice architecture
 * @param {Object} props
 * @param {import('./types').Microservice} props.microservice - The microservice data to visualize
 * @param {number} [props.width=800] - SVG width
 * @param {number} [props.height=800] - SVG height
 */
export const Graph = ({ microservice, width = 800, height = 800 }) => {
  const svgRef = useRef(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  // Layout configuration
  const centerX = width / 2;
  const centerY = height / 2;
  const microserviceRadius = 50;
  const gatewayRadius = 35;
  const endpointWidth = 120;
  const endpointHeight = 32;
  const gatewayRingRadius = 140;
  const outboundRingRadius = 280;
  const inboundRingRadius = 280;

  // Calculate positions for all elements
  const layout = useMemo(() => {
    if (!microservice || !microservice.gateways) return null;

    const gateways = microservice.gateways;
    const gatewayCount = gateways.length;
    
    // Distribute gateways evenly around the microservice
    const gatewayAngles = distributeOnArc(gatewayCount, 0, 360 - (360 / Math.max(gatewayCount, 1)));
    
    const gatewayLayouts = gateways.map((gateway, i) => {
      const angle = gatewayAngles[i] || 0;
      const pos = getPointOnCircle(centerX, centerY, gatewayRingRadius, angle);
      
      // Calculate arc segment for this gateway's endpoints
      const arcSpan = 360 / gatewayCount;
      const arcStart = angle - arcSpan / 2 + 10;
      const arcEnd = angle + arcSpan / 2 - 10;
      
      // Outbound endpoints (outer ring, one side)
      const outboundCount = gateway.outbound?.length || 0;
      const outboundAngles = distributeOnArc(outboundCount, arcStart, angle - 5);
      const outboundPositions = outboundAngles.map(a => ({
        ...getPointOnCircle(centerX, centerY, outboundRingRadius, a),
        angle: a
      }));
      
      // Inbound endpoints (outer ring, other side)
      const inboundCount = gateway.inbound?.length || 0;
      const inboundAngles = distributeOnArc(inboundCount, angle + 5, arcEnd);
      const inboundPositions = inboundAngles.map(a => ({
        ...getPointOnCircle(centerX, centerY, inboundRingRadius, a),
        angle: a
      }));
      
      return {
        gateway,
        position: pos,
        angle,
        outboundPositions,
        inboundPositions
      };
    });
    
    return { gatewayLayouts };
  }, [microservice, centerX, centerY]);

  const handleMouseEnter = useCallback((e, element, type, details) => {
    const rect = svgRef.current.getBoundingClientRect();
    setHoveredElement({ type, name: element });
    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 10,
      content: details
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredElement(null);
    setTooltip({ visible: false, x: 0, y: 0, content: '' });
  }, []);

  const handleClick = useCallback((element, type) => {
    setSelectedElement(prev => 
      prev?.name === element && prev?.type === type ? null : { type, name: element }
    );
  }, []);

  const handleExport = useCallback(() => {
    if (svgRef.current) {
      downloadSvg(svgRef.current, `${microservice?.name || 'microservice'}-architecture.svg`);
    }
  }, [microservice]);

  if (!microservice || !layout) {
    return (
      <div className="graph-container graph-empty">
        <p>No microservice data provided</p>
      </div>
    );
  }

  const isSelected = (name, type) => selectedElement?.name === name && selectedElement?.type === type;
  const isHovered = (name, type) => hoveredElement?.name === name && hoveredElement?.type === type;

  return (
    <div className="graph-container">
      <div className="graph-toolbar">
        <button className="export-btn" onClick={handleExport} data-testid="export-svg-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Export SVG
        </button>
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="graph-svg"
        data-testid="microservice-graph-svg"
      >
        <defs>
          {/* Gradient definitions */}
          <radialGradient id="microserviceGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor={COLORS.microservice.fillLight} />
            <stop offset="100%" stopColor={COLORS.microservice.fill} />
          </radialGradient>
          
          {Object.entries(COLORS.gateway).map(([type, colors]) => (
            <radialGradient key={type} id={`gateway${type}Gradient`} cx="30%" cy="30%">
              <stop offset="0%" stopColor={colors.fillLight} />
              <stop offset="100%" stopColor={colors.fill} />
            </radialGradient>
          ))}
          
          <linearGradient id="outboundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.outbound.fillLight} />
            <stop offset="100%" stopColor={COLORS.outbound.fill} />
          </linearGradient>
          
          <linearGradient id="inboundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.inbound.fillLight} />
            <stop offset="100%" stopColor={COLORS.inbound.fill} />
          </linearGradient>

          {/* Arrow markers */}
          <marker id="arrowOutbound" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.connection.outbound} />
          </marker>
          <marker id="arrowInbound" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.connection.inbound} />
          </marker>
        </defs>

        {/* Reference rings (subtle) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={gatewayRingRadius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="reference-ring"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={outboundRingRadius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="reference-ring"
        />

        {/* Connection lines layer */}
        <g className="connections-layer">
          {layout.gatewayLayouts.map((gl, gi) => (
            <g key={`connections-${gi}`}>
              {/* Microservice to Gateway connection */}
              <path
                d={generateBezierPath(
                  centerX, centerY,
                  gl.position.x, gl.position.y,
                  0.1
                )}
                fill="none"
                stroke={COLORS.gateway[gl.gateway.type]?.stroke || '#999'}
                strokeWidth="2"
                className="connection-line"
              />
              
              {/* Gateway to Outbound connections */}
              {gl.gateway.outbound?.map((_, oi) => (
                <path
                  key={`out-conn-${gi}-${oi}`}
                  d={generateBezierPath(
                    gl.position.x, gl.position.y,
                    gl.outboundPositions[oi]?.x || 0,
                    gl.outboundPositions[oi]?.y || 0,
                    0.2
                  )}
                  fill="none"
                  stroke={COLORS.connection.outbound}
                  strokeWidth="1.5"
                  markerEnd="url(#arrowOutbound)"
                  className="connection-line connection-outbound"
                />
              ))}
              
              {/* Gateway to Inbound connections */}
              {gl.gateway.inbound?.map((_, ii) => (
                <path
                  key={`in-conn-${gi}-${ii}`}
                  d={generateBezierPath(
                    gl.inboundPositions[ii]?.x || 0,
                    gl.inboundPositions[ii]?.y || 0,
                    gl.position.x, gl.position.y,
                    0.2
                  )}
                  fill="none"
                  stroke={COLORS.connection.inbound}
                  strokeWidth="1.5"
                  markerEnd="url(#arrowInbound)"
                  className="connection-line connection-inbound"
                />
              ))}
            </g>
          ))}
        </g>

        {/* Endpoints layer (rendered first so they're below gateways when not selected) */}
        <g className="endpoints-layer">
          {layout.gatewayLayouts.map((gl, gi) => (
            <g key={`endpoints-${gi}`}>
              {/* Outbound endpoints */}
              {gl.gateway.outbound?.map((endpoint, oi) => {
                const pos = gl.outboundPositions[oi];
                if (!pos) return null;
                const selected = isSelected(endpoint, 'outbound');
                const hovered = isHovered(endpoint, 'outbound');
                return (
                  <g
                    key={`outbound-${gi}-${oi}`}
                    className={`endpoint-group outbound ${selected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`}
                    style={{ zIndex: selected ? 1000 : 1 }}
                    onClick={() => handleClick(endpoint, 'outbound')}
                    onMouseEnter={(e) => handleMouseEnter(e, endpoint, 'outbound', `Outbound: ${endpoint}\nGateway: ${gl.gateway.name} (${gl.gateway.type})`)}
                    onMouseLeave={handleMouseLeave}
                    data-testid={`outbound-${endpoint.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <rect
                      x={pos.x - endpointWidth / 2}
                      y={pos.y - endpointHeight / 2}
                      width={endpointWidth}
                      height={endpointHeight}
                      rx="8"
                      ry="8"
                      fill="url(#outboundGradient)"
                      stroke={COLORS.outbound.stroke}
                      strokeWidth={selected ? 3 : 2}
                      className="endpoint-rect"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="500"
                      className="endpoint-text"
                    >
                      {endpoint.length > 14 ? endpoint.slice(0, 12) + '...' : endpoint}
                    </text>
                  </g>
                );
              })}
              
              {/* Inbound endpoints */}
              {gl.gateway.inbound?.map((endpoint, ii) => {
                const pos = gl.inboundPositions[ii];
                if (!pos) return null;
                const selected = isSelected(endpoint, 'inbound');
                const hovered = isHovered(endpoint, 'inbound');
                return (
                  <g
                    key={`inbound-${gi}-${ii}`}
                    className={`endpoint-group inbound ${selected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`}
                    style={{ zIndex: selected ? 1000 : 1 }}
                    onClick={() => handleClick(endpoint, 'inbound')}
                    onMouseEnter={(e) => handleMouseEnter(e, endpoint, 'inbound', `Inbound: ${endpoint}\nGateway: ${gl.gateway.name} (${gl.gateway.type})`)}
                    onMouseLeave={handleMouseLeave}
                    data-testid={`inbound-${endpoint.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <rect
                      x={pos.x - endpointWidth / 2}
                      y={pos.y - endpointHeight / 2}
                      width={endpointWidth}
                      height={endpointHeight}
                      rx="8"
                      ry="8"
                      fill="url(#inboundGradient)"
                      stroke={COLORS.inbound.stroke}
                      strokeWidth={selected ? 3 : 2}
                      className="endpoint-rect"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="500"
                      className="endpoint-text"
                    >
                      {endpoint.length > 14 ? endpoint.slice(0, 12) + '...' : endpoint}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </g>

        {/* Gateways layer */}
        <g className="gateways-layer">
          {layout.gatewayLayouts.map((gl, gi) => {
            const selected = isSelected(gl.gateway.name, 'gateway');
            const hovered = isHovered(gl.gateway.name, 'gateway');
            const gatewayColors = COLORS.gateway[gl.gateway.type] || COLORS.gateway.REST;
            return (
              <g
                key={`gateway-${gi}`}
                className={`gateway-group ${selected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`}
                onClick={() => handleClick(gl.gateway.name, 'gateway')}
                onMouseEnter={(e) => handleMouseEnter(e, gl.gateway.name, 'gateway', 
                  `Gateway: ${gl.gateway.name}\nType: ${gl.gateway.type}\nOutbound: ${gl.gateway.outbound?.length || 0}\nInbound: ${gl.gateway.inbound?.length || 0}`)}
                onMouseLeave={handleMouseLeave}
                data-testid={`gateway-${gl.gateway.name.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <circle
                  cx={gl.position.x}
                  cy={gl.position.y}
                  r={gatewayRadius}
                  fill={`url(#gateway${gl.gateway.type}Gradient)`}
                  stroke={gatewayColors.stroke}
                  strokeWidth={selected ? 3 : 2}
                  className="gateway-circle"
                />
                <text
                  x={gl.position.x}
                  y={gl.position.y - 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="600"
                  className="gateway-type"
                >
                  {gl.gateway.type}
                </text>
                <text
                  x={gl.position.x}
                  y={gl.position.y + 10}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                  className="gateway-name"
                >
                  {gl.gateway.name.length > 10 ? gl.gateway.name.slice(0, 8) + '...' : gl.gateway.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Microservice center bubble */}
        <g
          className={`microservice-group ${isSelected(microservice.name, 'microservice') ? 'selected' : ''} ${isHovered(microservice.name, 'microservice') ? 'hovered' : ''}`}
          onClick={() => handleClick(microservice.name, 'microservice')}
          onMouseEnter={(e) => handleMouseEnter(e, microservice.name, 'microservice', 
            `Microservice: ${microservice.name}\nID: ${microservice.id}\nGateways: ${microservice.gateways?.length || 0}`)}
          onMouseLeave={handleMouseLeave}
          data-testid="microservice-bubble"
        >
          <circle
            cx={centerX}
            cy={centerY}
            r={microserviceRadius}
            fill="url(#microserviceGradient)"
            stroke={COLORS.microservice.stroke}
            strokeWidth={isSelected(microservice.name, 'microservice') ? 4 : 3}
            className="microservice-circle"
          />
          <text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            className="microservice-name"
          >
            {microservice.name.length > 12 ? microservice.name.slice(0, 10) + '...' : microservice.name}
          </text>
        </g>

        {/* Tooltip */}
        {tooltip.visible && (
          <g className="tooltip-group" style={{ pointerEvents: 'none' }}>
            <rect
              x={tooltip.x}
              y={tooltip.y - 60}
              width={Math.max(150, tooltip.content.split('\n').reduce((max, line) => Math.max(max, line.length * 7), 0))}
              height={tooltip.content.split('\n').length * 18 + 12}
              rx="6"
              fill="rgba(33, 33, 33, 0.95)"
              stroke="#555"
              strokeWidth="1"
            />
            {tooltip.content.split('\n').map((line, i) => (
              <text
                key={i}
                x={tooltip.x + 10}
                y={tooltip.y - 45 + i * 18}
                fill="white"
                fontSize="12"
              >
                {line}
              </text>
            ))}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="graph-legend" data-testid="graph-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: COLORS.microservice.fill, borderRadius: '50%' }}></span>
          <span>Microservice</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: COLORS.gateway.REST.fill, borderRadius: '50%' }}></span>
          <span>REST Gateway</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: COLORS.gateway.KAFKA.fill, borderRadius: '50%' }}></span>
          <span>Kafka Gateway</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: COLORS.gateway.SOAP.fill, borderRadius: '50%' }}></span>
          <span>SOAP Gateway</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: COLORS.outbound.fill, borderRadius: '4px' }}></span>
          <span>Outbound (calls)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: COLORS.inbound.fill, borderRadius: '4px' }}></span>
          <span>Inbound (exposes)</span>
        </div>
      </div>
    </div>
  );
};

export default Graph;
