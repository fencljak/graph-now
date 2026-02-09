/**
 * @typedef {'REST' | 'KAFKA' | 'SOAP'} GatewayType
 */

/**
 * @typedef {Object} Gateway
 * @property {GatewayType} type
 * @property {string} name
 * @property {string[]} outbound - APIs/topics/services the microservice calls
 * @property {string[]} inbound - APIs/topics/services the microservice provides
 */

/**
 * @typedef {Object} Microservice
 * @property {string} name
 * @property {string} id
 * @property {Gateway[]} gateways
 */

export const GatewayTypes = {
  REST: 'REST',
  KAFKA: 'KAFKA',
  SOAP: 'SOAP'
};
