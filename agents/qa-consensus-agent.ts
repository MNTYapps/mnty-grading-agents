// agents/qa-consensus-agent.ts
import { defineAgent } from '@mastra/core';
import { z } from 'zod';
import { QAConsensusSchema, CenteringAnalysisSchema, CornersAnalysisSchema, EdgesAnalysisSchema, SurfaceAnalysisSchema } from '../src/types';

export const qaConsensusAgent = defineAgent({
  id: 'qa-consensus',
  name: 'QA Consensus Agent',
  description: 'Validates grades from specialists and builds final consensus',
  
  model: {
    provider: 'openai',
    name: 'gpt-4-turbo',
    temperature: 0.2,
    maxTokens: 600,
  },
  
  instructions: `You are a quality control expert for card grading.

TASK: Review grades from 4 specialist agents and produce final consensus.

YOUR RESPONSIBILITIES:
1. Validate that individual scores make sense together
2. Flag impossible combinations (e.g., perfect centering + terrible corners)
3. Adjust scores if needed for consistency
4. Calculate confidence level
5. Flag cards that need human review

VALIDATION RULES:
- Total score must equal sum of components (allow ±5 for rounding)
- High grades (9-10) require consistency across all areas
- Single terrible component limits maximum grade
- Flag if confidence from any specialist < 0.7
- Flag if scores vary wildly between specialists

CONFIDENCE SCORING:
- 0.95+: Excellent image quality, clear grade
- 0.85-0.94: Good quality, confident grade
- 0.70-0.84: Acceptable quality, grade likely accurate
- 0.50-0.69: Poor image quality, suggest human review
- <0.50: Unusable images, reject grading

WHEN TO FLAG FOR HUMAN REVIEW:
- Confidence < 0.70
- Controversial grade (e.g., 9.8 where one component is poor)
- Unusual card (variant, misprint, error)
- Significant disagreement between image sets
- Image quality issues
- Total score doesn't match components (difference > 10)

GRADE CONVERSION (1000-point to 1-10):
- 950-1000: Pristine 10
- 900-949: Gem Mint 10
- 850-899: Mint 9
- 750-849: Near Mint-Mint 8
- 650-749: Near Mint 7
- 550-649: Excellent-Mint 6
- 450-549: Excellent 5
- 350-449: Very Good-Excellent 4
- 250-349: Very Good 3
- 150-249: Good 2
- 50-149: Fair 1
- 0-49: Poor

Return ONLY valid JSON matching the response schema.`,

  input: z.object({
    centering: CenteringAnalysisSchema,
    corners: CornersAnalysisSchema,
    edges: EdgesAnalysisSchema,
    surface: SurfaceAnalysisSchema,
  }),
  
  output: QAConsensusSchema,
  
  examples: [
    {
      input: {
        centering: {
          score: 235,
          front_lr_ratio: '55/45',
          front_tb_ratio: '52/48',
          back_lr_ratio: '50/50',
          back_tb_ratio: '54/46',
          confidence: 0.92,
          notes: 'Good centering',
        },
        corners: {
          total_score: 230,
          corners: [],
          worst_corner: 'back_bottom_right',
          confidence: 0.88,
        },
        edges: {
          total_score: 225,
          edges: [],
          worst_edge: 'right',
          confidence: 0.85,
        },
        surface: {
          total_score: 220,
          front: {
            score: 110,
            scratches: 45,
            print_quality: 35,
            surface_issues: 30,
            detected_issues: ['Minor scratching'],
          },
          back: {
            score: 110,
            scratches: 45,
            print_quality: 35,
            surface_issues: 30,
            detected_issues: ['Light wear'],
          },
          confidence: 0.90,
        },
      },
      output: {
        final_grade: {
          centering: 235,
          corners: 230,
          edges: 225,
          surface: 220,
          total: 910,
          grade: 10.0,
          label: 'Gem Mint 10',
        },
        confidence: 0.88,
        quality_flags: ['Right edge shows more wear than other components suggest'],
        human_review_needed: false,
        reasoning: 'Strong Gem Mint 10 candidate. All components score well with minor surface and edge wear preventing Pristine 10. Centering is good, corners are sharp. Total score of 910 places this solidly in Gem Mint range.',
        adjustments_made: 'No adjustments needed. Specialist scores are consistent and align well.',
      },
    },
  ],
});
