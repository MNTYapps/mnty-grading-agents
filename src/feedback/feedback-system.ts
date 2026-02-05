/**
 * Feedback System for Agent Learning
 *
 * This system enables continuous improvement of grading agents through:
 * 1. Storing grading results with user corrections
 * 2. Analyzing patterns in corrections to identify systematic issues
 * 3. Providing few-shot examples to agents for better consistency
 * 4. Flagging cards for human review when confidence is low
 *
 * NOTE: This is a framework for future implementation. Full ML fine-tuning
 * requires additional infrastructure (training pipelines, model hosting).
 */

// Types for the feedback system
export interface GradingFeedback {
  id: string;
  card_id: string;
  timestamp: string;

  // Original AI scores
  ai_scores: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
    total: number;
    grade: number;
    label: string;
  };

  // User corrections (if any)
  user_corrections?: {
    centering?: number;
    corners?: number;
    edges?: number;
    surface?: number;
    grade?: number;
    notes?: string;
  };

  // Professional grade comparison (if user enters PSA/BGS grade later)
  pro_comparison?: {
    company: string;
    grade: number;
    cert_number?: string;
  };

  // Metadata
  card_type?: string;  // Pokemon, Sports, etc.
  card_set?: string;
  correction_source: 'user' | 'professional' | 'review';
  reviewed_at?: string;
}

export interface AgentPerformanceMetrics {
  agent_id: string;
  period_start: string;
  period_end: string;

  // Accuracy metrics
  total_gradings: number;
  corrections_received: number;
  average_deviation: number;  // Average difference between AI and corrected score

  // Patterns identified
  common_issues: {
    issue: string;
    frequency: number;
    example_card_ids: string[];
  }[];

  // Confidence calibration
  confidence_accuracy: {
    high_confidence_correct: number;  // % of high-confidence grades that were accurate
    low_confidence_flagged: number;   // % of low-confidence grades that needed correction
  };
}

/**
 * Reference Examples for Few-Shot Learning
 *
 * These examples help calibrate agent responses by showing what
 * correct scoring looks like for various conditions.
 */
export interface ReferenceExample {
  id: string;
  category: 'centering' | 'corners' | 'edges' | 'surface';
  condition: string;  // e.g., "perfect", "slight_whitening", "heavy_damage"
  score: number;
  description: string;
  image_url?: string;  // Optional reference image
}

// Centering reference examples
export const CENTERING_EXAMPLES: ReferenceExample[] = [
  {
    id: 'centering_perfect',
    category: 'centering',
    condition: 'perfect',
    score: 250,
    description: 'Perfect 50/50 centering on both axes, front and back. All four borders are exactly equal width.',
  },
  {
    id: 'centering_gem_mint',
    category: 'centering',
    condition: 'gem_mint',
    score: 240,
    description: '55/45 centering. Slight variance visible when measuring carefully but not obvious at first glance.',
  },
  {
    id: 'centering_mint',
    category: 'centering',
    condition: 'mint',
    score: 220,
    description: '60/40 centering. Noticeable difference between opposing borders but not severe.',
  },
  {
    id: 'centering_near_mint',
    category: 'centering',
    condition: 'near_mint',
    score: 190,
    description: '65/35 centering. Clearly visible off-center, one border noticeably wider than opposite.',
  },
  {
    id: 'centering_poor',
    category: 'centering',
    condition: 'poor',
    score: 100,
    description: '75/25 or worse. Severely off-center, one border may be almost touching the card edge.',
  },
];

// Corner reference examples
export const CORNER_EXAMPLES: ReferenceExample[] = [
  {
    id: 'corner_perfect',
    category: 'corners',
    condition: 'perfect',
    score: 62.5,  // Per corner
    description: 'Perfect sharp corner. No whitening, no dings, no wear. Point is crisp and defined.',
  },
  {
    id: 'corner_slight_wear',
    category: 'corners',
    condition: 'slight_wear',
    score: 55,
    description: 'Very minor softening of the point. No whitening visible. Requires magnification to see.',
  },
  {
    id: 'corner_light_whitening',
    category: 'corners',
    condition: 'light_whitening',
    score: 45,
    description: 'Light whitening visible on corner. Point still relatively sharp. Common on handled cards.',
  },
  {
    id: 'corner_moderate_wear',
    category: 'corners',
    condition: 'moderate_wear',
    score: 35,
    description: 'Obvious whitening and rounding of corner. Point is soft but corner shape maintained.',
  },
  {
    id: 'corner_heavy_damage',
    category: 'corners',
    condition: 'heavy_damage',
    score: 15,
    description: 'Heavy whitening, significant rounding, or ding/dent. Corner structure compromised.',
  },
];

// Edge reference examples
export const EDGE_EXAMPLES: ReferenceExample[] = [
  {
    id: 'edge_perfect',
    category: 'edges',
    condition: 'perfect',
    score: 62.5,  // Per edge
    description: 'Perfect smooth edge. No whitening, chipping, or surface damage along entire length.',
  },
  {
    id: 'edge_minor_whitening',
    category: 'edges',
    condition: 'minor_whitening',
    score: 52,
    description: 'Very light whitening in small spots. Edge is smooth to touch. Visible under bright light.',
  },
  {
    id: 'edge_moderate_whitening',
    category: 'edges',
    condition: 'moderate_whitening',
    score: 40,
    description: 'Noticeable whitening along portions of edge. May have light fuzzing.',
  },
  {
    id: 'edge_chipping',
    category: 'edges',
    condition: 'chipping',
    score: 25,
    description: 'Small chips or nicks visible. Edge is no longer smooth. Whitening is prominent.',
  },
];

// Surface reference examples
export const SURFACE_EXAMPLES: ReferenceExample[] = [
  {
    id: 'surface_perfect',
    category: 'surface',
    condition: 'perfect',
    score: 125,  // Per side (front/back)
    description: 'Pristine surface. No scratches, print defects, or blemishes. Gloss is even throughout.',
  },
  {
    id: 'surface_light_scratches',
    category: 'surface',
    condition: 'light_scratches',
    score: 105,
    description: 'Light surface scratches visible under direct light. Not visible in normal viewing.',
  },
  {
    id: 'surface_print_line',
    category: 'surface',
    condition: 'print_line',
    score: 90,
    description: 'Factory print line visible. This is a manufacturing defect, not wear damage.',
  },
  {
    id: 'surface_moderate_wear',
    category: 'surface',
    condition: 'moderate_wear',
    score: 70,
    description: 'Multiple scratches visible in normal light. Surface shows obvious handling wear.',
  },
  {
    id: 'surface_creasing',
    category: 'surface',
    condition: 'creasing',
    score: 40,
    description: 'Creases or indentations visible. Surface structure is compromised.',
  },
];

/**
 * Generate enhanced agent instructions with examples
 */
export function generateEnhancedInstructions(
  category: 'centering' | 'corners' | 'edges' | 'surface',
  baseInstructions: string
): string {
  const examples = {
    centering: CENTERING_EXAMPLES,
    corners: CORNER_EXAMPLES,
    edges: EDGE_EXAMPLES,
    surface: SURFACE_EXAMPLES,
  }[category];

  const examplesText = examples.map(ex =>
    `- ${ex.condition.toUpperCase()} (${ex.score} points): ${ex.description}`
  ).join('\n');

  return `${baseInstructions}

SCORING REFERENCE EXAMPLES:
${examplesText}

CONSISTENCY GUIDELINES:
1. Always compare the card against these reference examples
2. Score conservatively - it's better to be slightly low than too generous
3. If uncertain between two scores, choose the lower one
4. Document specific observations that justify your score
5. Flag for human review if confidence is below 0.7

COMMON MISTAKES TO AVOID:
- Don't confuse lighting artifacts with actual damage
- Don't penalize factory defects the same as wear damage
- Consider the card type - vintage cards have different standards
- Back centering matters as much as front centering`;
}

/**
 * Format feedback for training/fine-tuning
 *
 * This function prepares feedback data in a format suitable for:
 * - Few-shot prompt injection
 * - Fine-tuning datasets
 * - Analysis and reporting
 */
export function formatFeedbackForTraining(feedback: GradingFeedback[]): string {
  // Filter to only include feedback with corrections
  const corrections = feedback.filter(f => f.user_corrections || f.pro_comparison);

  if (corrections.length === 0) {
    return '';
  }

  // Format as examples
  const examples = corrections.slice(0, 5).map(f => {
    const original = f.ai_scores;
    const corrected = f.user_corrections || {};
    const proGrade = f.pro_comparison?.grade;

    return `Example correction:
- AI scored centering ${original.centering}, corrected to ${corrected.centering || original.centering}
- AI scored corners ${original.corners}, corrected to ${corrected.corners || original.corners}
- AI scored edges ${original.edges}, corrected to ${corrected.edges || original.edges}
- AI scored surface ${original.surface}, corrected to ${corrected.surface || original.surface}
- AI grade: ${original.grade}, ${proGrade ? `Professional grade: ${proGrade}` : ''}
- Notes: ${corrected.notes || 'No notes provided'}`;
  }).join('\n\n');

  return `
RECENT CORRECTION EXAMPLES (learn from these):
${examples}

Use these examples to calibrate your scoring. If the AI was consistently
scoring too high or low in a category, adjust accordingly.`;
}

/**
 * Calculate performance metrics from feedback
 */
export function calculateAgentMetrics(
  agentId: string,
  feedback: GradingFeedback[]
): AgentPerformanceMetrics {
  const relevantFeedback = feedback.filter(f =>
    f.user_corrections || f.pro_comparison
  );

  const totalDeviation = relevantFeedback.reduce((sum, f) => {
    const aiGrade = f.ai_scores.grade;
    const actualGrade = f.pro_comparison?.grade || f.user_corrections?.grade || aiGrade;
    return sum + Math.abs(aiGrade - actualGrade);
  }, 0);

  return {
    agent_id: agentId,
    period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    period_end: new Date().toISOString(),
    total_gradings: feedback.length,
    corrections_received: relevantFeedback.length,
    average_deviation: relevantFeedback.length > 0 ? totalDeviation / relevantFeedback.length : 0,
    common_issues: [],  // Would be populated by pattern analysis
    confidence_accuracy: {
      high_confidence_correct: 0,  // Would be calculated from data
      low_confidence_flagged: 0,
    },
  };
}
