import { Workflow, Step } from '@mastra/core';
import { z } from 'zod';

export const cardGradingWorkflow = new Workflow({
  name: 'card-grading-workflow',
  triggerSchema: z.object({
    images: z.object({
      front_full: z.string().url(),
      back_full: z.string().url(),
      front_corners: z.array(z.string().url()),
      back_corners: z.array(z.string().url()),
      edges: z.array(z.string().url()),
    }),
  }),
});

cardGradingWorkflow
  .step(centeringStep)
  .step(cornersStep)
  .then(consensusStep)
  .commit();

const centeringStep = new Step({
  id: 'analyze-centering',
  execute: async ({ context }) => {
    // Call centering agent
    return {
      score: 235,
      confidence: 0.9,
    };
  },
});

const cornersStep = new Step({
  id: 'analyze-corners',
  execute: async ({ context }) => {
    // Call corners agent
    return {
      total_score: 240,
      confidence: 0.88,
    };
  },
});

const consensusStep = new Step({
  id: 'build-consensus',
  execute: async ({ context }) => {
    const { centering, corners } = context.machineContext!;
    
    return {
      final_grade: {
        centering: centering.score,
        corners: corners.total_score,
        total: centering.score + corners.total_score,
        grade: 9.5,
        label: 'Gem Mint 10',
      },
    };
  },
});
