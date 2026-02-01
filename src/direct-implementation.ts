// src/direct-implementation.ts
// Simplified card grading using OpenAI and Anthropic directly
// Use this if Mastra.ai deployment is having issues

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { CardImages, GradingResult } from './types';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Grade a card using direct API calls (no Mastra framework needed)
 */
export async function gradeCardDirect(images: CardImages): Promise<GradingResult> {
  const startTime = Date.now();
  
  console.log('[Grading] Starting direct card grading...');
  
  // Step 1: Analyze centering (GPT-4 Vision)
  const centeringAnalysis = await analyzeCentering(images);
  
  // Step 2-4: Analyze corners, edges, surface in parallel
  const [cornersAnalysis, edgesAnalysis, surfaceAnalysis] = await Promise.all([
    analyzeCorners(images),
    analyzeEdges(images),
    analyzeSurface(images),
  ]);
  
  // Step 5: QA Consensus
  const qaConsensus = await buildConsensus({
    centering: centeringAnalysis,
    corners: cornersAnalysis,
    edges: edgesAnalysis,
    surface: surfaceAnalysis,
  });
  
  const processingTime = Date.now() - startTime;
  
  console.log(`[Grading] Completed in ${processingTime}ms`);
  console.log(`[Grading] Final grade: ${qaConsensus.final_grade.grade} - ${qaConsensus.final_grade.label}`);
  
  return {
    centering_analysis: centeringAnalysis,
    corners_analysis: cornersAnalysis,
    edges_analysis: edgesAnalysis,
    surface_analysis: surfaceAnalysis,
    qa_consensus: qaConsensus,
    processing_time_ms: processingTime,
    timestamp: new Date().toISOString(),
  };
}

async function analyzeCentering(images: CardImages) {
  const { object } = await generateObject({
    model: openai('gpt-4-vision-preview'),
    schema: z.object({
      score: z.number().min(0).max(250),
      front_lr_ratio: z.string(),
      front_tb_ratio: z.string(),
      back_lr_ratio: z.string(),
      back_tb_ratio: z.string(),
      confidence: z.number().min(0).max(1),
      notes: z.string(),
    }),
    messages: [
      {
        role: 'system',
        content: `You are an expert at analyzing trading card centering. Analyze the images and measure centering precision on a 0-250 point scale.
        
SCORING:
- 245-250: Perfect 50/50
- 230-244: 55/45 (Gem Mint)
- 210-229: 60/40 (Mint)

Return precise measurements.`,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze the centering of this trading card.' },
          { type: 'image', image: images.front_full },
          { type: 'image', image: images.back_full },
        ],
      },
    ],
  });
  
  return object;
}

async function analyzeCorners(images: CardImages) {
  const cornerImages = [
    ...images.front_corners.map((url, i) => ({ 
      position: ['front_top_left', 'front_top_right', 'front_bottom_left', 'front_bottom_right'][i],
      url 
    })),
    ...images.back_corners.map((url, i) => ({ 
      position: ['back_top_left', 'back_top_right', 'back_bottom_left', 'back_bottom_right'][i],
      url 
    })),
  ];
  
  const { object } = await generateObject({
    model: anthropic('claude-3-5-sonnet-20241022'),
    schema: z.object({
      total_score: z.number().min(0).max(250),
      corners: z.array(z.object({
        position: z.string(),
        score: z.number().min(0).max(62.5),
        sharpness: z.number().min(0).max(25),
        whitening: z.number().min(0).max(25),
        structural: z.number().min(0).max(12.5),
        issues: z.array(z.string()),
      })),
      worst_corner: z.string(),
      confidence: z.number().min(0).max(1),
    }),
    messages: [
      {
        role: 'user',
        content: `Analyze these 8 trading card corners for wear, sharpness, and whitening. Score each corner out of 62.5 points (25 sharpness + 25 whitening + 12.5 structural). Return JSON with all 8 corner analyses.`,
      },
    ],
  });
  
  return object;
}

async function analyzeEdges(images: CardImages) {
  const { object } = await generateObject({
    model: anthropic('claude-3-5-sonnet-20241022'),
    schema: z.object({
      total_score: z.number().min(0).max(250),
      edges: z.array(z.object({
        position: z.enum(['top', 'bottom', 'left', 'right']),
        score: z.number().min(0).max(62.5),
        smoothness: z.number().min(0).max(30),
        whitening: z.number().min(0).max(20),
        chipping: z.number().min(0).max(12.5),
        issues: z.array(z.string()),
      })),
      worst_edge: z.string(),
      confidence: z.number().min(0).max(1),
    }),
    messages: [
      {
        role: 'user',
        content: `Analyze these 4 trading card edges for smoothness, whitening, and chipping. Score each edge out of 62.5 points. Return JSON.`,
      },
    ],
  });
  
  return object;
}

async function analyzeSurface(images: CardImages) {
  const { object } = await generateObject({
    model: openai('gpt-4-vision-preview'),
    schema: z.object({
      total_score: z.number().min(0).max(250),
      front: z.object({
        score: z.number().min(0).max(125),
        scratches: z.number().min(0).max(50),
        print_quality: z.number().min(0).max(40),
        surface_issues: z.number().min(0).max(35),
        detected_issues: z.array(z.string()),
      }),
      back: z.object({
        score: z.number().min(0).max(125),
        scratches: z.number().min(0).max(50),
        print_quality: z.number().min(0).max(40),
        surface_issues: z.number().min(0).max(35),
        detected_issues: z.array(z.string()),
      }),
      confidence: z.number().min(0).max(1),
    }),
    messages: [
      {
        role: 'system',
        content: `Analyze trading card surfaces for scratches, print defects, and damage. Front and back each scored 0-125 points.`,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze the surface quality of this card.' },
          { type: 'image', image: images.front_full },
          { type: 'image', image: images.back_full },
        ],
      },
    ],
  });
  
  return object;
}

async function buildConsensus(analyses: any) {
  const { object } = await generateObject({
    model: openai('gpt-4-turbo'),
    schema: z.object({
      final_grade: z.object({
        centering: z.number().min(0).max(250),
        corners: z.number().min(0).max(250),
        edges: z.number().min(0).max(250),
        surface: z.number().min(0).max(250),
        total: z.number().min(0).max(1000),
        grade: z.number().min(0.5).max(10.0),
        label: z.string(),
      }),
      confidence: z.number().min(0).max(1),
      quality_flags: z.array(z.string()),
      human_review_needed: z.boolean(),
      reasoning: z.string(),
      adjustments_made: z.string(),
    }),
    messages: [
      {
        role: 'system',
        content: `You validate card grading analyses. Review the scores from specialists and build final consensus.
        
GRADE CONVERSION:
- 950-1000: Pristine 10
- 900-949: Gem Mint 10
- 850-899: Mint 9
- 750-849: Near Mint-Mint 8

Return final grade with confidence.`,
      },
      {
        role: 'user',
        content: `Here are the specialist analyses:\n\n${JSON.stringify(analyses, null, 2)}\n\nProvide final consensus grade.`,
      },
    ],
  });
  
  return object;
}
