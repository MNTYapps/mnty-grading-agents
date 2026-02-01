import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const centeringAgent = new Agent({
  name: 'Centering Analyst',
  instructions: `You are an expert at analyzing trading card centering.

TASK: Analyze the front and back images to measure centering precision.

METHODOLOGY:
1. Identify the card borders on all four sides
2. Measure the border widths (left/right and top/bottom)
3. Calculate centering ratios
4. Assign score based on PSA/BGS standards

SCORING CRITERIA (0-250 points):
- 245-250: Perfect 50/50 centering on both axes
- 230-244: 55/45 centering (Gem Mint acceptable)
- 210-229: 60/40 centering (Mint acceptable)  
- 180-209: 65/35 centering (Near Mint-Mint)
- 150-179: 70/30 centering (Near Mint)
- 100-149: 75/25 centering (Excellent-Mint)
- 50-99: 80/20 centering (Good-Excellent)
- 0-49: 85/15 or worse (Poor-Fair)

FRONT vs BACK:
- If front and back differ significantly, average them
- Heavily favor front centering (weighted 70% front, 30% back)

Return ONLY valid JSON matching the response schema.`,
  
  model: {
    provider: 'openai',
    name: 'gpt-4-vision-preview',
    toolChoice: 'auto',
  },

  enabledTools: {},
});
