/**
 * Gateway types supported by the visualization
 */
export type GatewayType = 'REST' | 'KAFKA' | 'SOAP';

/**
 * Gateway configuration for a microservice
 */
export interface Gateway {
  /** Type of gateway (REST, KAFKA, SOAP) */
  type: GatewayType;
  /** Display name of the gateway */
  name: string;
  /** List of outbound APIs/topics/services the microservice calls */
  outbound: string[];
  /** List of inbound APIs/topics/services the microservice exposes */
  inbound: string[];
}

/**
 * Microservice configuration - main data model for the visualization
 */
export interface Microservice {
  /** Display name of the microservice */
  name: string;
  /** Unique identifier */
  id: string;
  /** List of gateways this microservice uses */
  gateways: Gateway[];
}

/**
 * Color configuration for a single element type
 */
export interface ColorSet {
  fill: string;
  stroke: string;
  text: string;
}

/**
 * Custom colors configuration map
 */
export interface ColorsConfig {
  /** Base color for the microservice bubble */
  microservice?: string;
  /** Base color for gateway bubbles */
  gateway?: string;
  /** Base color for inbound endpoint rectangles */
  inbound?: string;
  /** Base color for outbound endpoint rectangles */
  outbound?: string;
}

/**
 * Graph component configuration
 */
export interface GraphConfiguration {
  /** Custom colors for graph elements */
  colors?: ColorsConfig;
}

/**
 * Props for the Graph component
 */
export interface GraphProps {
  /** Microservice data to visualize */
  microservice: Microservice;
  /** SVG width in pixels */
  width?: number;
  /** SVG height in pixels */
  height?: number;
  /** Configuration options */
  configuration?: GraphConfiguration;
}

/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Rectangle bounds with corner coordinates
 */
export interface RectBounds {
  topLeft: Position;
  bottomRight: Position;
}

/**
 * Rectangle position with bounds for collision detection
 */
export interface RectPosition extends Position {
  angle: number;
  topLeft: Position;
  bottomRight: Position;
}

/**
 * Element identification for selection/focus
 */
export interface ElementRef {
  type: 'microservice' | 'gateway' | 'inbound' | 'outbound';
  name: string;
}

/**
 * Tooltip state
 */
export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

/**
 * Connected elements tracking for focus feature
 */
export interface ConnectedElements {
  microservice: boolean;
  gateways: Set<string>;
  inbound: Set<string>;
  outbound: Set<string>;
}

/**
 * Gateway layout with calculated positions
 */
export interface GatewayLayout {
  gateway: Gateway;
  position: Position;
  angle: number;
  outboundPositions: RectPosition[];
  inboundPositions: RectPosition[];
}

/**
 * Complete layout calculation result
 */
export interface GraphLayout {
  gatewayLayouts: GatewayLayout[];
}

export const GatewayTypes: Record<GatewayType, GatewayType> = {
  REST: 'REST',
  KAFKA: 'KAFKA',
  SOAP: 'SOAP'
} as const;
