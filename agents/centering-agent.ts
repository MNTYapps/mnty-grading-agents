// agents/centering-agent.ts
import { defineAgent } from '@mastra/core';
import { z } from 'zod';
import { CenteringAnalysisSchema } from '../src/types';

export const centeringAgent = defineAgent({
  id: 'centering-analyst',
  name: 'Centering Analysis Agent',
  description: 'Expert at analyzing trading card centering from border measurements',
  
  model: {
    provider: 'openai',
    name: 'gpt-4-vision-preview',
    temperature: 0.05,
    maxTokens: 500,
  },
  
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

IMPORTANT:
- Be precise with ratio calculations
- Consider both horizontal (L/R) and vertical (T/B) centering
- A card can have perfect horizontal but poor vertical (or vice versa)
- PSA allows 60/40 for Gem Mint - don't be too harsh

Return ONLY valid JSON matching the response schema. No markdown, no explanations outside JSON.`,

  input: z.object({
    front_image: z.string().url().describe('URL to front full card image'),
    back_image: z.string().url().describe('URL to back full card image'),
  }),
  
  output: CenteringAnalysisSchema,
  
  examples: [
    {
      input: {
        front_image: 'https://example.com/front.jpg',
        back_image: 'https://example.com/back.jpg',
      },
      output: {
        score: 235,
        front_lr_ratio: '55/45',
        front_tb_ratio: '52/48',
        back_lr_ratio: '50/50',
        back_tb_ratio: '54/46',
        confidence: 0.92,
        notes: 'Front centering slightly favors right side but within Gem Mint standards. Back is nearly perfect.',
      },
    },
  ],
});
