// tools/index.ts
export { imageAnalysisTool } from './image-analysis';
export { gradeCalculatorTool } from './grade-calculator';
export { confidenceCalculatorTool } from './confidence-calculator';
export { marketValueEstimatorTool } from './market-value-estimator';

// Export all tools as array
export const allTools = [
  imageAnalysisTool,
  gradeCalculatorTool,
  confidenceCalculatorTool,
  marketValueEstimatorTool,
];
