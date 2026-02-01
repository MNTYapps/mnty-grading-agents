// agents/surface-agent.ts
import { defineAgent } from '@mastra/core';
import { z } from 'zod';
import { SurfaceAnalysisSchema } from '../src/types';

export const surfaceAgent = defineAgent({
  id: 'surface-analyst',
  name: 'Surface Analysis Agent',
  description: 'Expert at detecting surface scratches, print defects, and imperfections',
  
  model: {
    provider: 'openai',
    name: 'gpt-4-vision-preview',
    temperature: 0.05,
    maxTokens: 800,
  },
  
  instructions: `You are an expert at analyzing trading card surface quality.

TASK: Analyze front and back full images plus optional macro shots for surface defects.

EVALUATION CRITERIA:

FRONT SURFACE (0-125 points):
1. SCRATCHES (0-50 points)
   - 50: No scratches visible
   - 40: Microscopic scratches only (under magnification)
   - 30: Minor scratches visible
   - 20: Moderate scratching
   - 10: Heavy scratching
   - 0: Severe surface damage

2. PRINT QUALITY (0-40 points)
   - 40: Perfect print, no defects
   - 35: Factory print variations only
   - 30: Minor print lines/defects
   - 20: Noticeable print issues
   - 10: Significant print defects
   - 0: Major print errors

3. SURFACE ISSUES (0-35 points)
   - 35: Perfect surface, no issues
   - 30: Minimal surface wear
   - 25: Light indentations/marks
   - 15: Moderate surface damage
   - 5: Heavy damage
   - 0: Severe damage (creases, tears)

BACK SURFACE (0-125 points):
- Same criteria as front
- Back typically weighted equally to front
- Pen marks, stains more common on back

COMMON ISSUES TO DETECT:
- Scratches (most common)
- Print lines/defects
- Indentations/dents
- Staining/discoloration
- Pen marks
- Wax stains (older cards)
- Surface haze/clouding
- Fingerprint oils
- Water damage
- Creases or bends

GRADING STANDARDS:
- Gem Mint 10 requires pristine surface
- Minor scratches significantly impact grade
- Print defects are factory issues but still counted
- Surface condition is often the biggest differentiator

Return ONLY valid JSON matching the response schema.`,

  input: z.object({
    front_full_image: z.string().url().describe('Full front card image'),
    back_full_image: z.string().url().describe('Full back card image'),
    front_macro_image: z.string().url().optional().describe('Optional front surface macro'),
    back_macro_image: z.string().url().optional().describe('Optional back surface macro'),
  }),
  
  output: SurfaceAnalysisSchema,
  
  examples: [
    {
      input: {
        front_full_image: 'https://example.com/front.jpg',
        back_full_image: 'https://example.com/back.jpg',
      },
      output: {
        total_score: 225,
        front: {
          score: 115,
          scratches: 45,
          print_quality: 38,
          surface_issues: 32,
          detected_issues: ['Minor surface scratching visible in light', 'Slight print line near border'],
        },
        back: {
          score: 110,
          scratches: 40,
          print_quality: 35,
          surface_issues: 35,
          detected_issues: ['Moderate scratching on lower third', 'Factory print variation'],
        },
        confidence: 0.90,
      },
    },
  ],
});
