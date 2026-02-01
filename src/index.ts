// src/index.ts
import { Mastra } from '@mastra/core';
import config from '../mastra.config';
import { allAgents } from '../agents';
import { cardGradingWorkflow } from '../workflows/card-grading-workflow';

// Initialize Mastra instance
export const mastra = new Mastra(config);

// Register all agents
allAgents.forEach(agent => {
  mastra.registerAgent(agent);
});

// Register workflow
mastra.registerWorkflow(cardGradingWorkflow);

// Export for use in other modules
export { allAgents, cardGradingWorkflow };
export * from './types';

// Main execution function
export async function gradeCard(images: any) {
  try {
    console.log('[Mastra] Starting card grading workflow...');
    
    const result = await mastra.executeWorkflow('card-grading-complete', images);
    
    console.log('[Mastra] Grading completed successfully');
    console.log(`[Mastra] Total score: ${result.qa_consensus.final_grade.total}/1000`);
    console.log(`[Mastra] Grade: ${result.qa_consensus.final_grade.grade} - ${result.qa_consensus.final_grade.label}`);
    console.log(`[Mastra] Confidence: ${(result.qa_consensus.confidence * 100).toFixed(1)}%`);
    console.log(`[Mastra] Processing time: ${result.processing_time_ms}ms`);
    
    return result;
  } catch (error) {
    console.error('[Mastra] Grading workflow failed:', error);
    throw error;
  }
}

// Alternative: Use orchestrator agent directly
export async function gradeCardWithOrchestrator(images: any) {
  try {
    console.log('[Mastra] Starting orchestrator agent...');
    
    const result = await mastra.runAgent('card-grading-orchestrator', images);
    
    console.log('[Mastra] Orchestrator completed');
    return result;
  } catch (error) {
    console.error('[Mastra] Orchestrator failed:', error);
    throw error;
  }
}
