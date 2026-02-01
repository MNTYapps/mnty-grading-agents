import { Agent } from '@mastra/core';
import { anthropic } from '@ai-sdk/anthropic';

export const cornersAgent = new Agent({
  name: 'Corners Analyst',
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

Return ONLY valid JSON.`,
  
  model: {
    provider: 'anthropic',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'auto',
  },

  enabledTools: {},
});
