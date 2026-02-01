// src/types.ts
import { z } from 'zod';

// Card images schema
export const CardImagesSchema = z.object({
  front_full: z.string().url(),
  back_full: z.string().url(),
  front_corners: z.array(z.string().url()).length(4),
  back_corners: z.array(z.string().url()).length(4),
  edges: z.array(z.string().url()).length(4),
  front_surface_macro: z.string().url().optional(),
  back_surface_macro: z.string().url().optional(),
});

export type CardImages = z.infer<typeof CardImagesSchema>;

// Centering analysis
export const CenteringAnalysisSchema = z.object({
  score: z.number().min(0).max(250),
  front_lr_ratio: z.string(),
  front_tb_ratio: z.string(),
  back_lr_ratio: z.string(),
  back_tb_ratio: z.string(),
  confidence: z.number().min(0).max(1),
  notes: z.string(),
});

export type CenteringAnalysis = z.infer<typeof CenteringAnalysisSchema>;

// Corner analysis
export const CornerDetailSchema = z.object({
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
  score: z.number().min(0).max(62.5),
  sharpness: z.number().min(0).max(25),
  whitening: z.number().min(0).max(25),
  structural: z.number().min(0).max(12.5),
  issues: z.array(z.string()),
});

export const CornersAnalysisSchema = z.object({
  total_score: z.number().min(0).max(250),
  corners: z.array(CornerDetailSchema).length(8),
  worst_corner: z.string(),
  confidence: z.number().min(0).max(1),
});

export type CornersAnalysis = z.infer<typeof CornersAnalysisSchema>;

// Edge analysis
export const EdgeDetailSchema = z.object({
  position: z.enum(['top', 'bottom', 'left', 'right']),
  score: z.number().min(0).max(62.5),
  smoothness: z.number().min(0).max(30),
  whitening: z.number().min(0).max(20),
  chipping: z.number().min(0).max(12.5),
  issues: z.array(z.string()),
});

export const EdgesAnalysisSchema = z.object({
  total_score: z.number().min(0).max(250),
  edges: z.array(EdgeDetailSchema).length(4),
  worst_edge: z.string(),
  confidence: z.number().min(0).max(1),
});

export type EdgesAnalysis = z.infer<typeof EdgesAnalysisSchema>;

// Surface analysis
export const SurfaceDetailSchema = z.object({
  score: z.number().min(0).max(125),
  scratches: z.number().min(0).max(50),
  print_quality: z.number().min(0).max(40),
  surface_issues: z.number().min(0).max(35),
  detected_issues: z.array(z.string()),
});

export const SurfaceAnalysisSchema = z.object({
  total_score: z.number().min(0).max(250),
  front: SurfaceDetailSchema,
  back: SurfaceDetailSchema,
  confidence: z.number().min(0).max(1),
});

export type SurfaceAnalysis = z.infer<typeof SurfaceAnalysisSchema>;

// Final grade
export const FinalGradeSchema = z.object({
  centering: z.number().min(0).max(250),
  corners: z.number().min(0).max(250),
  edges: z.number().min(0).max(250),
  surface: z.number().min(0).max(250),
  total: z.number().min(0).max(1000),
  grade: z.number().min(0.5).max(10.0),
  label: z.string(),
});

export type FinalGrade = z.infer<typeof FinalGradeSchema>;

// QA consensus
export const QAConsensusSchema = z.object({
  final_grade: FinalGradeSchema,
  confidence: z.number().min(0).max(1),
  quality_flags: z.array(z.string()),
  human_review_needed: z.boolean(),
  reasoning: z.string(),
  adjustments_made: z.string(),
});

export type QAConsensus = z.infer<typeof QAConsensusSchema>;

// Complete grading result
export const GradingResultSchema = z.object({
  centering_analysis: CenteringAnalysisSchema,
  corners_analysis: CornersAnalysisSchema,
  edges_analysis: EdgesAnalysisSchema,
  surface_analysis: SurfaceAnalysisSchema,
  qa_consensus: QAConsensusSchema,
  processing_time_ms: z.number(),
  timestamp: z.string(),
});

export type GradingResult = z.infer<typeof GradingResultSchema>;
