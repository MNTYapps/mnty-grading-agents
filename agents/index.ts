// agents/index.ts
export { centeringAgent } from './centering-agent';
export { cornersAgent } from './corners-agent';
export { edgesAgent } from './edges-agent';
export { surfaceAgent } from './surface-agent';
export { qaConsensusAgent } from './qa-consensus-agent';
export { orchestratorAgent } from './orchestrator-agent';

// Export all agents as array for easy registration
export const allAgents = [
  centeringAgent,
  cornersAgent,
  edgesAgent,
  surfaceAgent,
  qaConsensusAgent,
  orchestratorAgent,
];
