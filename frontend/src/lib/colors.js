// Material Design color palette for visualization
// Border is LIGHTER than fill for all elements
export const COLORS = {
  // Microservice - Deep Purple
  microservice: {
    fill: '#7C4DFF',
    stroke: '#B388FF', // lighter
    text: '#FFFFFF'
  },
  // Gateway types
  gateway: {
    REST: {
      fill: '#00BCD4',
      stroke: '#4DD0E1', // lighter
      text: '#FFFFFF'
    },
    KAFKA: {
      fill: '#FF9800',
      stroke: '#FFB74D', // lighter
      text: '#FFFFFF'
    },
    SOAP: {
      fill: '#9C27B0',
      stroke: '#CE93D8', // lighter
      text: '#FFFFFF'
    }
  },
  // Outbound - Teal
  outbound: {
    fill: '#26A69A',
    stroke: '#80CBC4', // lighter
    text: '#FFFFFF'
  },
  // Inbound - Indigo
  inbound: {
    fill: '#5C6BC0',
    stroke: '#9FA8DA', // lighter
    text: '#FFFFFF'
  },
  // Connection lines
  connection: {
    outbound: '#26A69A',
    inbound: '#5C6BC0'
  }
};
