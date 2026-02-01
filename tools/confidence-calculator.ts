// tools/confidence-calculator.ts
import { defineTool } from '@mastra/core';
import { z } from 'zod';

/**
 * Confidence Calculator Tool
 * Calculates overall confidence score based on specialist agent confidences
 */
export const confidenceCalculatorTool = defineTool({
  id: 'calculate-confidence',
  name: 'Confidence Calculator',
  description: 'Calculates overall confidence score from specialist agent confidences',
  
  input: z.object({
    centering_confidence: z.number().min(0).max(1),
    corners_confidence: z.number().min(0).max(1),
    edges_confidence: z.number().min(0).max(1),
    surface_confidence: z.number().min(0).max(1),
    score_variance: z.number().min(0).optional().describe('Variance between component scores'),
  }),
  
  output: z.object({
    overall_confidence: z.number().min(0).max(1),
    confidence_level: z.enum(['very_high', 'high', 'medium', 'low', 'very_low']),
    recommend_human_review: z.boolean(),
    reasoning: z.string(),
    weakest_component: z.string(),
  }),
  
  execute: async ({
    centering_confidence,
    corners_confidence,
    edges_confidence,
    surface_confidence,
    score_variance = 0,
  }) => {
    // Calculate weighted average (favor visual components)
    const weights = {
      centering: 0.20,
      corners: 0.30,
      edges: 0.25,
      surface: 0.25,
    };
    
    const weighted_confidence = 
      centering_confidence * weights.centering +
      corners_confidence * weights.corners +
      edges_confidence * weights.edges +
      surface_confidence * weights.surface;
    
    // Apply variance penalty (high variance between components = lower confidence)
    const variance_penalty = Math.min(score_variance / 1000, 0.2); // Max 0.2 penalty
    const overall_confidence = Math.max(0, Math.min(1, weighted_confidence - variance_penalty));
    
    // Determine confidence level
    let confidence_level: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
    let recommend_human_review: boolean;
    let reasoning: string;
    
    if (overall_confidence >= 0.90) {
      confidence_level = 'very_high';
      recommend_human_review = false;
      reasoning = 'Excellent image quality and consistent analysis across all components';
    } else if (overall_confidence >= 0.80) {
      confidence_level = 'high';
      recommend_human_review = false;
      reasoning = 'Good image quality and reliable analysis';
    } else if (overall_confidence >= 0.70) {
      confidence_level = 'medium';
      recommend_human_review = false;
      reasoning = 'Acceptable analysis quality, grade is likely accurate';
    } else if (overall_confidence >= 0.60) {
      confidence_level = 'low';
      recommend_human_review = true;
      reasoning = 'Lower confidence due to image quality or inconsistent component scores';
    } else {
      confidence_level = 'very_low';
      recommend_human_review = true;
      reasoning = 'Poor image quality or significant inconsistencies detected';
    }
    
    // Find weakest component
    const confidences = {
      centering: centering_confidence,
      corners: corners_confidence,
      edges: edges_confidence,
      surface: surface_confidence,
    };
    
    const weakest_component = Object.entries(confidences)
      .sort(([, a], [, b]) => a - b)[0][0];
    
    return {
      overall_confidence,
      confidence_level,
      recommend_human_review,
      reasoning,
      weakest_component,
    };
  },
});
