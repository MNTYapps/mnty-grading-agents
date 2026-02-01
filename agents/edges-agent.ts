// agents/edges-agent.ts
import { defineAgent } from '@mastra/core';
import { z } from 'zod';
import { EdgesAnalysisSchema } from '../src/types';

export const edgesAgent = defineAgent({
  id: 'edges-analyst',
  name: 'Edge Analysis Agent',
  description: 'Expert at detecting edge wear, chipping, and whitening on trading cards',
  
  model: {
    provider: 'anthropic',
    name: 'claude-3-5-sonnet-20241022',
    temperature: 0.05,
    maxTokens: 800,
  },
  
  instructions: `You are an expert at analyzing trading card edges.

TASK: Analyze 4 edge images (top, bottom, left, right) for wear, chipping, and whitening.

EVALUATION CRITERIA per edge (62.5 points max each):

1. SMOOTHNESS (0-30 points)
   - 30: Perfectly smooth edge, no roughness
   - 25: Minimal roughness, factory fresh
   - 20: Slight roughness but clean
   - 15: Minor edge wear visible
   - 10: Moderate roughness/fraying
   - 5: Significant fraying
   - 0: Severe damage/chunks missing

2. WHITENING (0-20 points)
   - 20: No whitening at all
   - 16: Microscopic whitening only
   - 12: Minor whitening visible
   - 8: Moderate whitening
   - 4: Significant whitening
   - 0: Severe whitening

3. CHIPPING (0-12.5 points)
   - 12.5: No chips at all
   - 10: Microscopic imperfections only
   - 7.5: Minor chips present
   - 5: Moderate chipping
   - 2.5: Significant chips
   - 0: Severe chipping/missing pieces

STANDARDS:
- Gem Mint requires near-perfect edges
- Even minor whitening drops score significantly
- Single bad edge can lower entire grade
- Factory cut variations are normal, don't over-penalize
- Consistent edge quality is important

EDGE POSITIONS:
- top, bottom, left, right

Return ONLY valid JSON matching the response schema.`,

  input: z.object({
    edge_images: z.array(z.object({
      position: z.enum(['top', 'bottom', 'left', 'right']),
      url: z.string().url(),
    })).length(4).describe('4 edge close-up images'),
  }),
  
  output: EdgesAnalysisSchema,
  
  examples: [
    {
      input: {
        edge_images: [
          { position: 'top', url: 'https://example.com/top.jpg' },
          { position: 'bottom', url: 'https://example.com/bottom.jpg' },
          { position: 'left', url: 'https://example.com/left.jpg' },
          { position: 'right', url: 'https://example.com/right.jpg' },
        ],
      },
      output: {
        total_score: 230,
        edges: [
          {
            position: 'top',
            score: 60.0,
            smoothness: 28,
            whitening: 18,
            chipping: 12,
            issues: ['Minor whitening on right side'],
          },
          {
            position: 'bottom',
            score: 58.0,
            smoothness: 26,
            whitening: 16,
            chipping: 12,
            issues: ['Slight roughness', 'Minor whitening'],
          },
          {
            position: 'left',
            score: 62.0,
            smoothness: 30,
            whitening: 20,
            chipping: 12,
            issues: [],
          },
          {
            position: 'right',
            score: 50.0,
            smoothness: 22,
            whitening: 14,
            chipping: 10,
            issues: ['Moderate whitening', 'Small chip visible'],
          },
        ],
        worst_edge: 'right',
        confidence: 0.87,
      },
    },
  ],
});
