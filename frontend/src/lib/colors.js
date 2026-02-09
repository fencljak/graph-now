// Material Design color palette for visualization
export const COLORS = {
  // Microservice - Deep Purple
  microservice: {
    fill: '#7C4DFF',
    fillLight: '#E8E0FF',
    stroke: '#651FFF',
    text: '#311B92'
  },
  // Gateway types
  gateway: {
    REST: {
      fill: '#00BCD4',
      fillLight: '#E0F7FA',
      stroke: '#00ACC1',
      text: '#006064'
    },
    KAFKA: {
      fill: '#FF9800',
      fillLight: '#FFF3E0',
      stroke: '#FB8C00',
      text: '#E65100'
    },
    SOAP: {
      fill: '#9C27B0',
      fillLight: '#F3E5F5',
      stroke: '#8E24AA',
      text: '#4A148C'
    }
  },
  // Outbound - Teal
  outbound: {
    fill: '#26A69A',
    fillLight: '#E0F2F1',
    stroke: '#00897B',
    text: '#004D40'
  },
  // Inbound - Indigo
  inbound: {
    fill: '#5C6BC0',
    fillLight: '#E8EAF6',
    stroke: '#3F51B5',
    text: '#1A237E'
  },
  // Connection lines
  connection: {
    outbound: '#26A69A',
    inbound: '#5C6BC0'
  }
};
