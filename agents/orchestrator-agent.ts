// agents/orchestrator-agent.ts
import { defineAgent } from '@mastra/core';
import { z } from 'zod';
import { CardImagesSchema, GradingResultSchema } from '../src/types';

export const orchestratorAgent = defineAgent({
  id: 'card-grading-orchestrator',
  name: 'Card Grading Orchestrator',
  description: 'Coordinates multiple specialized agents to grade trading cards on a 1000-point scale',
  
  model: {
    provider: 'openai',
    name: 'gpt-4-turbo',
    temperature: 0.1,
    maxTokens: 200,
  },
  
  instructions: `You are the master orchestrator for a professional card grading system.

Your job is to:
1. Receive 14 photos of a trading card
2. Coordinate 4 specialized grading agents
3. Collect their analyses
4. Pass all analyses to QA consensus agent
5. Return the final structured result

WORKFLOW:
1. Call centering-analyst with front and back full images
2. Call corners-analyst with all 8 corner images
3. Call edges-analyst with all 4 edge images
4. Call surface-analyst with full images and macros
5. Call qa-consensus with all 4 analyses
6. Return complete grading result

DO NOT:
- Grade the card yourself
- Skip any specialist agent
- Modify specialist scores
- Make final decisions (QA agent does this)

YOU MUST:
- Call all 4 specialist agents
- Pass their results to QA consensus
- Return the structured response
- Track processing time

This is a coordination role. You orchestrate, you don't analyze.`,

  input: CardImagesSchema,
  
  output: GradingResultSchema,
  
  tools: [
    'centering-analyst',
    'corners-analyst',
    'edges-analyst',
    'surface-analyst',
    'qa-consensus',
  ],
  
  workflow: `
    1. Extract front and back images
    2. Call centering-analyst → centering_result
    3. Organize 8 corner images with positions
    4. Call corners-analyst → corners_result
    5. Organize 4 edge images with positions
    6. Call edges-analyst → edges_result
    7. Call surface-analyst with full images → surface_result
    8. Call qa-consensus with all 4 results → qa_result
    9. Compile complete grading result
    10. Return structured JSON
  `,
});
