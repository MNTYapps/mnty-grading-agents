// tools/grade-calculator.ts
import { defineTool } from '@mastra/core';
import { z } from 'zod';

/**
 * Grade Calculator Tool
 * Converts 1000-point scores to standard grading labels
 */
export const gradeCalculatorTool = defineTool({
  id: 'calculate-grade',
  name: 'Grade Calculator',
  description: 'Converts 1000-point total score to standard 1-10 grade with label',
  
  input: z.object({
    total_score: z.number().min(0).max(1000).describe('Total score from all components'),
    centering: z.number().min(0).max(250).optional(),
    corners: z.number().min(0).max(250).optional(),
    edges: z.number().min(0).max(250).optional(),
    surface: z.number().min(0).max(250).optional(),
  }),
  
  output: z.object({
    grade: z.number().min(0.5).max(10.0),
    label: z.string(),
    grade_range: z.object({
      min: z.number(),
      max: z.number(),
    }),
    comparable_to: z.array(z.string()).describe('Comparable professional grades'),
  }),
  
  execute: async ({ total_score, centering, corners, edges, surface }) => {
    // Validate components match total (if provided)
    if (centering !== undefined && corners !== undefined && edges !== undefined && surface !== undefined) {
      const calculated_total = centering + corners + edges + surface;
      const difference = Math.abs(calculated_total - total_score);
      
      if (difference > 10) {
        throw new Error(`Component scores don't match total: ${calculated_total} vs ${total_score}`);
      }
    }
    
    // Calculate grade based on total score
    let grade: number;
    let label: string;
    let gradeRange: { min: number; max: number };
    let comparableTo: string[];
    
    if (total_score >= 950) {
      grade = 10.0;
      label = 'Pristine 10';
      gradeRange = { min: 950, max: 1000 };
      comparableTo = ['PSA 10 (Black Label)', 'BGS 10 Pristine'];
    } else if (total_score >= 900) {
      grade = 10.0;
      label = 'Gem Mint 10';
      gradeRange = { min: 900, max: 949 };
      comparableTo = ['PSA 10', 'BGS 9.5', 'CGC 10'];
    } else if (total_score >= 850) {
      grade = 9.0;
      label = 'Mint 9';
      gradeRange = { min: 850, max: 899 };
      comparableTo = ['PSA 9', 'BGS 9', 'CGC 9.5'];
    } else if (total_score >= 750) {
      grade = 8.0;
      label = 'Near Mint-Mint 8';
      gradeRange = { min: 750, max: 849 };
      comparableTo = ['PSA 8', 'BGS 8', 'CGC 8.5-9'];
    } else if (total_score >= 650) {
      grade = 7.0;
      label = 'Near Mint 7';
      gradeRange = { min: 650, max: 749 };
      comparableTo = ['PSA 7', 'BGS 7', 'CGC 7.5-8'];
    } else if (total_score >= 550) {
      grade = 6.0;
      label = 'Excellent-Mint 6';
      gradeRange = { min: 550, max: 649 };
      comparableTo = ['PSA 6', 'BGS 6', 'CGC 6.5-7'];
    } else if (total_score >= 450) {
      grade = 5.0;
      label = 'Excellent 5';
      gradeRange = { min: 450, max: 549 };
      comparableTo = ['PSA 5', 'BGS 5', 'CGC 5.5-6'];
    } else if (total_score >= 350) {
      grade = 4.0;
      label = 'Very Good-Excellent 4';
      gradeRange = { min: 350, max: 449 };
      comparableTo = ['PSA 4', 'BGS 4', 'CGC 4.5-5'];
    } else if (total_score >= 250) {
      grade = 3.0;
      label = 'Very Good 3';
      gradeRange = { min: 250, max: 349 };
      comparableTo = ['PSA 3', 'BGS 3', 'CGC 3.5-4'];
    } else if (total_score >= 150) {
      grade = 2.0;
      label = 'Good 2';
      gradeRange = { min: 150, max: 249 };
      comparableTo = ['PSA 2', 'BGS 2', 'CGC 2.5-3'];
    } else if (total_score >= 50) {
      grade = 1.0;
      label = 'Fair 1';
      gradeRange = { min: 50, max: 149 };
      comparableTo = ['PSA 1', 'BGS 1', 'CGC 1.5-2'];
    } else {
      grade = 0.5;
      label = 'Poor';
      gradeRange = { min: 0, max: 49 };
      comparableTo = ['PSA 0.5', 'BGS 0.5', 'CGC 1'];
    }
    
    return {
      grade,
      label,
      grade_range: gradeRange,
      comparable_to: comparableTo,
    };
  },
});
