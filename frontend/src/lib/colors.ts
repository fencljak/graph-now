import type { ColorSet } from './types';

export interface ColorPalette {
  microservice: ColorSet;
  gateway: ColorSet;
  inbound: ColorSet;
  outbound: ColorSet;
}

// Default grey color for fallback when no configuration provided
export const DEFAULT_COLOR = '#9E9E9E';

// Legacy COLORS object for backwards compatibility (not used with configuration)
export const COLORS = {
  microservice: {
    fill: '#7C4DFF',
    stroke: '#B388FF',
    text: '#FFFFFF'
  },
  gateway: {
    REST: {
      fill: '#00BCD4',
      stroke: '#4DD0E1',
      text: '#FFFFFF'
    },
    KAFKA: {
      fill: '#FF9800',
      stroke: '#FFB74D',
      text: '#FFFFFF'
    },
    SOAP: {
      fill: '#9C27B0',
      stroke: '#CE93D8',
      text: '#FFFFFF'
    }
  },
  inbound: {
    fill: '#5C6BC0',
    stroke: '#9FA8DA',
    text: '#FFFFFF'
  },
  outbound: {
    fill: '#26A69A',
    stroke: '#80CBC4',
    text: '#FFFFFF'
  },
  connection: {
    outbound: '#26A69A',
    inbound: '#5C6BC0'
  }
} as const;
