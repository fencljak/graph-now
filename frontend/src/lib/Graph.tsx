import React, { useRef, useState, useMemo, useCallback } from 'react';
import type {
  GraphProps,
  Microservice,
  ElementRef,
  TooltipState,
  ConnectedElements,
  GatewayLayout,
  GraphLayout,
  RectPosition,
  Position,
  ColorSet
} from './types';
import { DEFAULT_COLOR } from './colors';
import {
  getPointOnCircle,
  distributeOnArc,
  downloadSvg,
  getCircleEdgePoint,
  getRectEdgePoint,
  generateColorSet,
  rectsCollide
} from './utils';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';
import { Edge } from './Edge';
import { Ring } from './Ring';
import './Graph.css';

interface ColorPalette {
  microservice: ColorSet;
  gateway: ColorSet;
  inbound: ColorSet;
  outbound: ColorSet;
}

/**
 * MicroserviceGraph - SVG visualization component for microservice architecture
 */
export const Graph: React.FC<GraphProps> = ({
  microservice,
  width = 800,
  height = 800,
  configuration = {}
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementRef | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementRef | null>(null);
  const [focusedElement, setFocusedElement] = useState<ElementRef | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  });

  // Build color palette from configuration or defaults
  const colors = useMemo<ColorPalette>(() => {
    const userColors = configuration.colors || {};
    
    return {
      microservice: generateColorSet(userColors.microservice || DEFAULT_COLOR),
      gateway: generateColorSet(userColors.gateway || DEFAULT_COLOR),
      inbound: generateColorSet(userColors.inbound || DEFAULT_COLOR),
      outbound: generateColorSet(userColors.outbound || DEFAULT_COLOR),
    };
  }, [configuration.colors]);

  // Calculate which elements are within 1 edge of the focused element
  const getConnectedElements = useCallback(
    (focused: ElementRef | null, msData: Microservice | null): ConnectedElements | null => {
      if (!focused || !msData) return null;
      
      const connected: ConnectedElements = {
        microservice: false,
        gateways: new Set<string>(),
        inbound: new Set<string>(),
        outbound: new Set<string>()
      };
      
      if (focused.type === 'microservice') {
        connected.microservice = true;
        msData.gateways?.forEach(gw => connected.gateways.add(gw.name));
      } 
      else if (focused.type === 'gateway') {
        connected.microservice = true;
        connected.gateways.add(focused.name);
        const gw = msData.gateways?.find(g => g.name === focused.name);
        if (gw) {
          gw.inbound?.forEach(ep => connected.inbound.add(ep));
          gw.outbound?.forEach(ep => connected.outbound.add(ep));
        }
      }
      else if (focused.type === 'inbound') {
        connected.inbound.add(focused.name);
        msData.gateways?.forEach(gw => {
          if (gw.inbound?.includes(focused.name)) {
            connected.gateways.add(gw.name);
          }
        });
      }
      else if (focused.type === 'outbound') {
        connected.outbound.add(focused.name);
        msData.gateways?.forEach(gw => {
          if (gw.outbound?.includes(focused.name)) {
            connected.gateways.add(gw.name);
          }
        });
      }
      
      return connected;
    },
    []
  );

  // Memoize connected elements
  const connectedElements = useMemo<ConnectedElements | null>(() => {
    return getConnectedElements(focusedElement, microservice);
  }, [focusedElement, microservice, getConnectedElements]);

  // Get opacity for an element based on focus state
  const getOpacity = useCallback(
    (name: string, type: ElementRef['type']): number => {
      if (!focusedElement || !connectedElements) return 1;
      
      if (type === 'microservice') {
        return connectedElements.microservice ? 1 : 0.2;
      }
      if (type === 'gateway') {
        return connectedElements.gateways.has(name) ? 1 : 0.2;
      }
      if (type === 'inbound') {
        return connectedElements.inbound.has(name) ? 1 : 0.2;
      }
      if (type === 'outbound') {
        return connectedElements.outbound.has(name) ? 1 : 0.2;
      }
      return 1;
    },
    [focusedElement, connectedElements]
  );

  // Get opacity for connection lines
  const getConnectionOpacity = useCallback(
    (
      fromType: ElementRef['type'],
      fromName: string,
      toType: ElementRef['type'],
      toName: string
    ): number => {
      if (!focusedElement || !connectedElements) return 1;
      
      const fromVisible = getOpacity(fromName, fromType) === 1;
      const toVisible = getOpacity(toName, toType) === 1;
      
      return (fromVisible && toVisible) ? 1 : 0.2;
    },
    [focusedElement, connectedElements, getOpacity]
  );

  // Layout configuration
  const centerX = width / 2;
  const centerY = height / 2;
  const microserviceRadius = 50;
  const gatewayRadius = 35;
  const endpointWidth = 120;
  const endpointHeight = 32;
  
  // Default ring gap (90px) and calculate ring radiuses based on configuration
  const defaultRingGap = 90;
  const ringGap = configuration.ringGap?.value ?? defaultRingGap;
  const gatewayRingRadius = 140;
  const inboundRingRadius = gatewayRingRadius + ringGap;
  const outboundRingRadius = gatewayRingRadius + ringGap * 2;

  // Calculate positions for all elements
  const layout = useMemo<GraphLayout | null>(() => {
    if (!microservice || !microservice.gateways) return null;

    const gateways = microservice.gateways;
    const gatewayCount = gateways.length;
    
    const gatewayAngles = distributeOnArc(
      gatewayCount,
      0,
      360 - (360 / Math.max(gatewayCount, 1))
    );
    
    const createRectPosition = (centerPos: Position, angle: number): RectPosition => ({
      x: centerPos.x,
      y: centerPos.y,
      angle,
      topLeft: {
        x: centerPos.x - endpointWidth / 2,
        y: centerPos.y - endpointHeight / 2
      },
      bottomRight: {
        x: centerPos.x + endpointWidth / 2,
        y: centerPos.y + endpointHeight / 2
      }
    });

    const resolveCollisions = (
      positions: RectPosition[],
      ringRadius: number,
      direction: number = 1
    ): RectPosition[] => {
      if (positions.length < 2) return positions;
      
      const resolved = [...positions];
      let hasCollision = true;
      let iterations = 0;
      const maxIterations = 100;
      
      while (hasCollision && iterations < maxIterations) {
        hasCollision = false;
        iterations++;
        
        // Check ALL pairs of rectangles, not just consecutive ones
        for (let i = 0; i < resolved.length; i++) {
          for (let j = i + 1; j < resolved.length; j++) {
            if (rectsCollide(resolved[i], resolved[j])) {
              hasCollision = true;
              // Move the later rectangle further along the ring
              const newAngle = resolved[j].angle + direction * 3;
              const newCenter = getPointOnCircle(centerX, centerY, ringRadius, newAngle);
              resolved[j] = createRectPosition(newCenter, newAngle);
            }
          }
        }
      }
      
      return resolved;
    };

    const gatewayLayouts: GatewayLayout[] = gateways.map((gateway, i) => {
      const angle = gatewayAngles[i] || 0;
      const pos = getPointOnCircle(centerX, centerY, gatewayRingRadius, angle);
      
      const inboundCount = gateway.inbound?.length || 0;
      const outboundCount = gateway.outbound?.length || 0;
      
      const inboundSpacing = 15;
      const outboundSpacing = 15;
      
      const inboundTotalSpan = Math.max(0, (inboundCount - 1) * inboundSpacing);
      const outboundTotalSpan = Math.max(0, (outboundCount - 1) * outboundSpacing);
      
      const inboundCenterAngle = angle - 20;
      const inboundStartAngle = inboundCenterAngle - inboundTotalSpan / 2;
      
      const outboundCenterAngle = angle + 20;
      const outboundStartAngle = outboundCenterAngle - outboundTotalSpan / 2;
      
      let inboundPositions: RectPosition[] = Array.from(
        { length: inboundCount },
        (_, idx) => {
          const a = inboundStartAngle + idx * inboundSpacing;
          const centerPos = getPointOnCircle(centerX, centerY, inboundRingRadius, a);
          return createRectPosition(centerPos, a);
        }
      );
      
      let outboundPositions: RectPosition[] = Array.from(
        { length: outboundCount },
        (_, idx) => {
          const a = outboundStartAngle + idx * outboundSpacing;
          const centerPos = getPointOnCircle(centerX, centerY, outboundRingRadius, a);
          return createRectPosition(centerPos, a);
        }
      );
      
      inboundPositions = resolveCollisions(inboundPositions, inboundRingRadius, -1);
      outboundPositions = resolveCollisions(outboundPositions, outboundRingRadius, 1);
      
      return {
        gateway,
        position: pos,
        angle,
        outboundPositions,
        inboundPositions
      };
    });
    
    return { gatewayLayouts };
  }, [microservice, centerX, centerY, endpointWidth, endpointHeight, gatewayRingRadius, inboundRingRadius, outboundRingRadius]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, element: string, type: ElementRef['type'], details: string) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setHoveredElement({ type, name: element });
      setTooltip({
        visible: true,
        x: e.clientX - rect.left + 10,
        y: e.clientY - rect.top - 10,
        content: details
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredElement(null);
    setTooltip({ visible: false, x: 0, y: 0, content: '' });
  }, []);

  const handleClick = useCallback((element: string, type: ElementRef['type']) => {
    setSelectedElement(prev => 
      prev?.name === element && prev?.type === type ? null : { type, name: element }
    );
    setFocusedElement(prev => 
      prev?.name === element && prev?.type === type ? null : { type, name: element }
    );
  }, []);

  const handleBackgroundClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    if (target.tagName === 'svg' || target.dataset.background === 'true') {
      setSelectedElement(null);
      setFocusedElement(null);
    }
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

  const isSelected = (name: string, type: ElementRef['type']): boolean =>
    selectedElement?.name === name && selectedElement?.type === type;
  
  const isHovered = (name: string, type: ElementRef['type']): boolean =>
    hoveredElement?.name === name && hoveredElement?.type === type;

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
        onClick={handleBackgroundClick}
      >
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="transparent"
          data-background="true"
        />
        <defs>
          <marker id="arrowOutbound" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.outbound.fill} />
          </marker>
          <marker id="arrowInbound" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.inbound.fill} />
          </marker>
          
          <marker id="originGateway" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
            <circle cx="5" cy="5" r="4" fill={colors.gateway.stroke} />
          </marker>
          <marker id="originInbound" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
            <circle cx="5" cy="5" r="4" fill={colors.inbound.stroke} />
          </marker>
          <marker id="originMicroservice" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
            <circle cx="5" cy="5" r="4" fill={colors.microservice.stroke} />
          </marker>
        </defs>

        <Ring cx={centerX} cy={centerY} radius={gatewayRingRadius} />
        <Ring cx={centerX} cy={centerY} radius={inboundRingRadius} />
        <Ring cx={centerX} cy={centerY} radius={outboundRingRadius} />

        <g className="connections-layer">
          {layout.gatewayLayouts.map((gl, gi) => {
            const msToGwStart = getCircleEdgePoint(centerX, centerY, microserviceRadius, gl.position.x, gl.position.y);
            const msToGwEnd = getCircleEdgePoint(gl.position.x, gl.position.y, gatewayRadius, centerX, centerY);
            const msToGwOpacity = getConnectionOpacity('microservice', microservice.name, 'gateway', gl.gateway.name);
            
            return (
              <g key={`connections-${gi}`}>
                <Edge
                  startX={msToGwStart.x}
                  startY={msToGwStart.y}
                  endX={msToGwEnd.x}
                  endY={msToGwEnd.y}
                  stroke={colors.gateway.stroke}
                  strokeWidth={2}
                  curvature={0.1}
                  markerStart="originMicroservice"
                  opacity={msToGwOpacity}
                />
                
                {gl.gateway.outbound?.map((endpointName, oi) => {
                  const outPos = gl.outboundPositions[oi];
                  if (!outPos) return null;
                  
                  const gwEdge = getCircleEdgePoint(gl.position.x, gl.position.y, gatewayRadius, outPos.x, outPos.y);
                  const outEdge = getRectEdgePoint(outPos.x, outPos.y, endpointWidth, endpointHeight, gl.position.x, gl.position.y);
                  const connOpacity = getConnectionOpacity('gateway', gl.gateway.name, 'outbound', endpointName);
                  
                  return (
                    <Edge
                      key={`out-conn-${gi}-${oi}`}
                      startX={gwEdge.x}
                      startY={gwEdge.y}
                      endX={outEdge.x}
                      endY={outEdge.y}
                      stroke={colors.outbound.fill}
                      strokeWidth={1.5}
                      curvature={0.2}
                      markerStart="originGateway"
                      markerEnd="arrowOutbound"
                      opacity={connOpacity}
                      className="connection-outbound"
                    />
                  );
                })}
                
                {gl.gateway.inbound?.map((endpointName, ii) => {
                  const inPos = gl.inboundPositions[ii];
                  if (!inPos) return null;
                  
                  const inEdge = getRectEdgePoint(inPos.x, inPos.y, endpointWidth, endpointHeight, gl.position.x, gl.position.y);
                  const gwEdge = getCircleEdgePoint(gl.position.x, gl.position.y, gatewayRadius, inPos.x, inPos.y);
                  const connOpacity = getConnectionOpacity('inbound', endpointName, 'gateway', gl.gateway.name);
                  
                  return (
                    <Edge
                      key={`in-conn-${gi}-${ii}`}
                      startX={inEdge.x}
                      startY={inEdge.y}
                      endX={gwEdge.x}
                      endY={gwEdge.y}
                      stroke={colors.inbound.fill}
                      strokeWidth={1.5}
                      curvature={0.2}
                      markerStart="originInbound"
                      markerEnd="arrowInbound"
                      opacity={connOpacity}
                      className="connection-inbound"
                    />
                  );
                })}
              </g>
            );
          })}
        </g>

        <g className="endpoints-layer">
          {layout.gatewayLayouts.map((gl, gi) => (
            <g key={`endpoints-${gi}`}>
              {gl.gateway.outbound?.map((endpoint, oi) => {
                const pos = gl.outboundPositions[oi];
                if (!pos) return null;
                return (
                  <Rectangle
                    key={`outbound-${gi}-${oi}`}
                    x={pos.x}
                    y={pos.y}
                    width={endpointWidth}
                    height={endpointHeight}
                    fill={colors.outbound.fill}
                    stroke={colors.outbound.stroke}
                    textColor={colors.outbound.text}
                    text={endpoint}
                    opacity={getOpacity(endpoint, 'outbound')}
                    selected={isSelected(endpoint, 'outbound')}
                    hovered={isHovered(endpoint, 'outbound')}
                    onClick={() => handleClick(endpoint, 'outbound')}
                    onMouseEnter={(e) => handleMouseEnter(e, endpoint, 'outbound', `Outbound: ${endpoint}\nGateway: ${gl.gateway.name} (${gl.gateway.type})`)}
                    onMouseLeave={handleMouseLeave}
                    testId={`outbound-${endpoint.replace(/\s+/g, '-').toLowerCase()}`}
                    className="outbound"
                  />
                );
              })}
              
              {gl.gateway.inbound?.map((endpoint, ii) => {
                const pos = gl.inboundPositions[ii];
                if (!pos) return null;
                return (
                  <Rectangle
                    key={`inbound-${gi}-${ii}`}
                    x={pos.x}
                    y={pos.y}
                    width={endpointWidth}
                    height={endpointHeight}
                    fill={colors.inbound.fill}
                    stroke={colors.inbound.stroke}
                    textColor={colors.inbound.text}
                    text={endpoint}
                    opacity={getOpacity(endpoint, 'inbound')}
                    selected={isSelected(endpoint, 'inbound')}
                    hovered={isHovered(endpoint, 'inbound')}
                    onClick={() => handleClick(endpoint, 'inbound')}
                    onMouseEnter={(e) => handleMouseEnter(e, endpoint, 'inbound', `Inbound: ${endpoint}\nGateway: ${gl.gateway.name} (${gl.gateway.type})`)}
                    onMouseLeave={handleMouseLeave}
                    testId={`inbound-${endpoint.replace(/\s+/g, '-').toLowerCase()}`}
                    className="inbound"
                  />
                );
              })}
            </g>
          ))}
        </g>

        <g className="gateways-layer">
          {layout.gatewayLayouts.map((gl, gi) => (
            <Circle
              key={`gateway-${gi}`}
              cx={gl.position.x}
              cy={gl.position.y}
              radius={gatewayRadius}
              fill={colors.gateway.fill}
              stroke={colors.gateway.stroke}
              textColor={colors.gateway.text}
              textLines={[
                { text: gl.gateway.type, fontSize: 10, fontWeight: 600, yOffset: -5 },
                { text: gl.gateway.name, fontSize: 9, fontWeight: 'normal', yOffset: 10 }
              ]}
              maxTextLength={10}
              opacity={getOpacity(gl.gateway.name, 'gateway')}
              selected={isSelected(gl.gateway.name, 'gateway')}
              hovered={isHovered(gl.gateway.name, 'gateway')}
              onClick={() => handleClick(gl.gateway.name, 'gateway')}
              onMouseEnter={(e) => handleMouseEnter(e, gl.gateway.name, 'gateway', 
                `Gateway: ${gl.gateway.name}\nType: ${gl.gateway.type}\nOutbound: ${gl.gateway.outbound?.length || 0}\nInbound: ${gl.gateway.inbound?.length || 0}`)}
              onMouseLeave={handleMouseLeave}
              testId={`gateway-${gl.gateway.name.replace(/\s+/g, '-').toLowerCase()}`}
              className="gateway-group"
              circleClassName="gateway-circle"
            />
          ))}
        </g>

        <Circle
          cx={centerX}
          cy={centerY}
          radius={microserviceRadius}
          fill={colors.microservice.fill}
          stroke={colors.microservice.stroke}
          strokeWidth={3}
          textColor={colors.microservice.text}
          text={microservice.name}
          maxTextLength={12}
          opacity={getOpacity(microservice.name, 'microservice')}
          selected={isSelected(microservice.name, 'microservice')}
          hovered={isHovered(microservice.name, 'microservice')}
          onClick={() => handleClick(microservice.name, 'microservice')}
          onMouseEnter={(e) => handleMouseEnter(e, microservice.name, 'microservice', 
            `Microservice: ${microservice.name}\nID: ${microservice.id}\nGateways: ${microservice.gateways?.length || 0}`)}
          onMouseLeave={handleMouseLeave}
          testId="microservice-bubble"
          className="microservice-group"
          circleClassName="microservice-circle"
        />

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

      <div className="graph-legend" data-testid="graph-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: colors.microservice.fill, borderRadius: '50%' }}></span>
          <span>Microservice</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: colors.gateway.fill, borderRadius: '50%' }}></span>
          <span>Gateway</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: colors.outbound.fill, borderRadius: '4px' }}></span>
          <span>Outbound (calls)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: colors.inbound.fill, borderRadius: '4px' }}></span>
          <span>Inbound (exposes)</span>
        </div>
      </div>
    </div>
  );
};

export default Graph;
