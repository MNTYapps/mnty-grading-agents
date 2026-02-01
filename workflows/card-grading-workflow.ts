// workflows/card-grading-workflow.ts
import { defineWorkflow, Step } from '@mastra/core';
import { CardImagesSchema, GradingResultSchema } from '../src/types';

export const cardGradingWorkflow = defineWorkflow({
  id: 'card-grading-complete',
  name: 'Complete Card Grading Workflow',
  description: 'End-to-end workflow for grading a trading card using 6 specialized agents',
  
  input: CardImagesSchema,
  output: GradingResultSchema,
  
  steps: [
    // Step 1: Analyze Centering
    Step('analyze-centering', {
      agent: 'centering-analyst',
      input: (workflowInput) => ({
        front_image: workflowInput.front_full,
        back_image: workflowInput.back_full,
      }),
      output: 'centering_analysis',
    }),
    
    // Step 2: Analyze Corners (in parallel with Step 3-4)
    Step('analyze-corners', {
      agent: 'corners-analyst',
      input: (workflowInput) => ({
        corner_images: [
          { position: 'front_top_left', url: workflowInput.front_corners[0] },
          { position: 'front_top_right', url: workflowInput.front_corners[1] },
          { position: 'front_bottom_left', url: workflowInput.front_corners[2] },
          { position: 'front_bottom_right', url: workflowInput.front_corners[3] },
          { position: 'back_top_left', url: workflowInput.back_corners[0] },
          { position: 'back_top_right', url: workflowInput.back_corners[1] },
          { position: 'back_bottom_left', url: workflowInput.back_corners[2] },
          { position: 'back_bottom_right', url: workflowInput.back_corners[3] },
        ],
      }),
      output: 'corners_analysis',
      runAfter: ['analyze-centering'],
    }),
    
    // Step 3: Analyze Edges
    Step('analyze-edges', {
      agent: 'edges-analyst',
      input: (workflowInput) => ({
        edge_images: [
          { position: 'top', url: workflowInput.edges[0] },
          { position: 'bottom', url: workflowInput.edges[1] },
          { position: 'left', url: workflowInput.edges[2] },
          { position: 'right', url: workflowInput.edges[3] },
        ],
      }),
      output: 'edges_analysis',
      runAfter: ['analyze-centering'],
    }),
    
    // Step 4: Analyze Surface
    Step('analyze-surface', {
      agent: 'surface-analyst',
      input: (workflowInput) => ({
        front_full_image: workflowInput.front_full,
        back_full_image: workflowInput.back_full,
        front_macro_image: workflowInput.front_surface_macro,
        back_macro_image: workflowInput.back_surface_macro,
      }),
      output: 'surface_analysis',
      runAfter: ['analyze-centering'],
    }),
    
    // Step 5: QA Consensus (waits for all analyses)
    Step('build-consensus', {
      agent: 'qa-consensus',
      input: (workflowInput, stepOutputs) => ({
        centering: stepOutputs['analyze-centering'],
        corners: stepOutputs['analyze-corners'],
        edges: stepOutputs['analyze-edges'],
        surface: stepOutputs['analyze-surface'],
      }),
      output: 'qa_consensus',
      runAfter: ['analyze-corners', 'analyze-edges', 'analyze-surface'],
    }),
    
    // Step 6: Compile Final Result
    Step('compile-result', {
      handler: (workflowInput, stepOutputs) => {
        const startTime = Date.now();
        
        return {
          centering_analysis: stepOutputs['analyze-centering'],
          corners_analysis: stepOutputs['analyze-corners'],
          edges_analysis: stepOutputs['analyze-edges'],
          surface_analysis: stepOutputs['analyze-surface'],
          qa_consensus: stepOutputs['build-consensus'],
          processing_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };
      },
      output: 'final_result',
      runAfter: ['build-consensus'],
    }),
  ],
  
  // Workflow configuration
  config: {
    retries: 2,
    timeout: 180000, // 3 minutes
    parallelExecution: true, // Steps 2-4 run in parallel
    errorHandling: 'continue', // Continue on non-critical errors
  },
});
