// agents/corners-agent.ts
import { defineAgent } from '@mastra/core';
import { z } from 'zod';
import { CornersAnalysisSchema } from '../src/types';

export const cornersAgent = defineAgent({
  id: 'corners-analyst',
  name: 'Corner Analysis Agent',
  description: 'Expert at detecting corner wear, sharpness, and whitening on trading cards',
  
  model: {
    provider: 'anthropic',
    name: 'claude-3-5-sonnet-20241022',
    temperature: 0.05,
    maxTokens: 1000,
  },
  
  instructions: `You are an expert at analyzing trading card corners.

TASK: Analyze 8 corner images (4 front, 4 back) for wear, sharpness, and whitening.

EVALUATION CRITERIA per corner (62.5 points max each):

1. SHARPNESS (0-25 points)
   - 25: Perfect sharp corner, no rounding
   - 20: Minimal rounding, barely visible
   - 15: Slight rounding, visible under magnification
   - 10: Moderate rounding, visible to naked eye
   - 5: Heavy rounding
   - 0: Severely damaged/bent

2. WHITENING (0-25 points)
   - 25: No whitening at all
   - 20: Microscopic whitening only
   - 15: Minor whitening on corner tip
   - 10: Visible whitening on corner
   - 5: Significant whitening
   - 0: Severe whitening/damage

3. STRUCTURAL (0-12.5 points)
   - 12.5: Perfect structure, no bends/creases
   - 10: Minimal wear
   - 7.5: Slight structural issues
   - 5: Moderate damage
   - 0: Severe damage/creases

IMPORTANT:
- Each corner graded individually, then summed
- Front corners weighted 60%, back corners 40%
- One bad corner significantly impacts total
- Be slightly stricter than lenient (match PSA standards)
- Gem Mint 10 requires near-perfect corners
- Even minor whitening drops score

CORNER POSITIONS:
- front_top_left, front_top_right, front_bottom_left, front_bottom_right
- back_top_left, back_top_right, back_bottom_left, back_bottom_right

Return ONLY valid JSON matching the response schema.`,

  input: z.object({
    corner_images: z.array(z.object({
      position: z.enum([
        'front_top_left',
        'front_top_right',
        'front_bottom_left',
        'front_bottom_right',
        'back_top_left',
        'back_top_right',
        'back_bottom_left',
        'back_bottom_right',
      ]),
      url: z.string().url(),
    })).length(8).describe('8 corner close-up images'),
  }),
  
  output: CornersAnalysisSchema,
  
  examples: [
    {
      input: {
        corner_images: [
          { position: 'front_top_left', url: 'https://example.com/ftl.jpg' },
          { position: 'front_top_right', url: 'https://example.com/ftr.jpg' },
          { position: 'front_bottom_left', url: 'https://example.com/fbl.jpg' },
          { position: 'front_bottom_right', url: 'https://example.com/fbr.jpg' },
          { position: 'back_top_left', url: 'https://example.com/btl.jpg' },
          { position: 'back_top_right', url: 'https://example.com/btr.jpg' },
          { position: 'back_bottom_left', url: 'https://example.com/bbl.jpg' },
          { position: 'back_bottom_right', url: 'https://example.com/bbr.jpg' },
        ],
      },
      output: {
        total_score: 235,
        corners: [
          {
            position: 'front_top_left',
            score: 60.0,
            sharpness: 24,
            whitening: 24,
            structural: 12,
            issues: ['Minor edge fraying'],
          },
          // ... other 7 corners
        ],
        worst_corner: 'back_bottom_right',
        confidence: 0.89,
      },
    },
  ],
});
