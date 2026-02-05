/**
 * Grading Result Types
 *
 * These types define the JSON output format from the grading agents.
 * They are designed to integrate with the mntyx mobile app's GradedCard type.
 *
 * Integration with mntyx:
 * - card_details maps to GradedCard fields: card_name, card_set, card_number, year
 * - market_data.estimated_value maps to GradedCard.estimated_value
 * - market_data.last_sale_date maps to GradedCard.last_comp_date
 * - grading.individual_scores maps to GradedCard.ai_*_score fields
 * - grading.numeric_grade maps to GradedCard.ai_grade
 * - grading.final_grade maps to GradedCard.ai_label
 */

// Individual grading scores from specialist agents
export interface IndividualScores {
  centering: number;  // 0-250 points
  corners: number;    // 0-250 points
  edges: number;      // 0-250 points
  surface: number;    // 0-250 points
}

// Grading result from QA Consensus agent
export interface GradingResult {
  final_grade: string;        // Grade label (e.g., "Gem Mint 10")
  numeric_grade: number;      // 1.0 to 10.0
  confidence: number;         // 0 to 1
  individual_scores: IndividualScores;
  total_points: number;       // 0-1000
  human_review_needed: boolean;
  reasoning: string;
}

// Comparable sale record
export interface ComparableSale {
  price: number;
  grade: number;
  grade_company: string;      // PSA, BGS, CGC, SGC, HGA, TAG
  sale_date: string;          // ISO date (YYYY-MM-DD)
  source: string;             // eBay, PWCC, Goldin, Heritage, etc.
}

// Population report data
export interface PopulationReport {
  total_graded: number | null;
  at_grade_10: number | null;
  at_grade_9: number | null;
  higher_grades: number | null;
}

// Card identification details from Card Research agent
export interface CardDetails {
  card_name: string;              // Full card name including player/character
  card_set: string;               // Set name (e.g., "2023 Topps Chrome")
  card_number: string;            // Card number in set
  year: number;                   // Release year
  brand: string;                  // Manufacturer (Pokemon, Topps, Panini, etc.)
  sport_or_category: string;      // Baseball, Basketball, Pokemon, Magic, etc.
  player_name: string | null;     // Player name for sports cards
  character_name: string | null;  // Character name for TCG cards
  variant: string | null;         // Parallel/variant type (Refractor, Holo, etc.)
  is_rookie: boolean;
  is_numbered: boolean;
  serial_number: string | null;   // If numbered (e.g., "25/99")
  is_autographed: boolean;
  is_memorabilia: boolean;        // Has jersey/patch piece
  rarity: string;                 // Common, Uncommon, Rare, Ultra Rare, etc.
}

// Market data from Card Research agent
export interface MarketData {
  estimated_value: number;        // USD at the given grade
  value_range_low: number;
  value_range_high: number;
  raw_value: number;              // Value if ungraded
  price_trend: 'rising' | 'stable' | 'declining';
  last_sale_price: number | null;
  last_sale_date: string | null;  // ISO date (YYYY-MM-DD)
  comparable_sales: ComparableSale[];
  population_report: PopulationReport;
}

// Additional metadata
export interface ResultMetadata {
  identification_confidence: number;  // 0-1 confidence in card identification
  pricing_confidence: number;         // 0-1 confidence in pricing estimate
  notes: string;
}

/**
 * Complete Grading Result
 *
 * This is the final output from the orchestrator after all agents have run.
 * It combines grading scores, card identification, and market data.
 */
export interface CompleteGradingResult {
  grading: GradingResult;
  card_details: CardDetails;
  market_data: MarketData;
  metadata: ResultMetadata;
}

// =============================================================================
// QUICK ADD FLOW TYPES
// =============================================================================

/**
 * Graded value hint for Quick Add
 * Shows potential value if the card were to be graded
 */
export interface GradedValueHint {
  psa_10_estimate: number | null;
  psa_9_estimate: number | null;
  note: string;  // e.g., "Grade this card to see AI-estimated graded value"
}

/**
 * Market data specific to Quick Add (focused on raw values)
 */
export interface QuickAddMarketData {
  raw_value: number;
  raw_value_range_low: number;
  raw_value_range_high: number;
  price_trend: 'rising' | 'stable' | 'declining';
  last_sale_price: number | null;
  last_sale_date: string | null;
  graded_value_hint: GradedValueHint;
  comparable_sales: QuickAddComparableSale[];
  population_report: PopulationReport;
}

/**
 * Comparable sale for Quick Add (includes raw condition)
 */
export interface QuickAddComparableSale {
  price: number;
  condition: 'raw' | 'graded';
  grade: number | null;
  grade_company: string | null;
  sale_date: string;
  source: string;
}

/**
 * Metadata for Quick Add results
 */
export interface QuickAddMetadata {
  identification_confidence: number;
  pricing_confidence: number;
  notes: string;
  upgrade_suggestion: string;  // Suggestion to grade if card is valuable
}

/**
 * Quick Add Result
 *
 * This is the output from the cardResearchOrchestrator for the Quick Add flow.
 * It provides card identification and raw market values without grading scores.
 *
 * Use Case: Users who want to quickly catalog cards without full grading.
 */
export interface QuickAddResult {
  card_details: CardDetails;
  market_data: QuickAddMarketData;
  metadata: QuickAddMetadata;
}

/**
 * Maps CompleteGradingResult to mntyx GradedCard fields
 *
 * Usage in mntyx:
 * ```typescript
 * import { CompleteGradingResult, mapToGradedCardFields } from '@mnty/grading-agents';
 *
 * const result: CompleteGradingResult = await gradeCard(images);
 * const cardFields = mapToGradedCardFields(result);
 *
 * await supabase.from('graded_cards').insert({
 *   user_id,
 *   images,
 *   ...cardFields
 * });
 * ```
 */
export interface GradedCardFields {
  // Card identification
  card_name: string | null;
  card_set: string | null;
  card_number: string | null;
  year: number | null;

  // AI Grading scores
  ai_centering_score: number;
  ai_corners_score: number;
  ai_edges_score: number;
  ai_surface_score: number;
  ai_total_score: number;
  ai_grade: number;
  ai_label: string;

  // Market data
  estimated_value: number | null;
  last_comp_date: string | null;
}

/**
 * Helper function to map grading result to mntyx GradedCard fields
 */
export function mapToGradedCardFields(result: CompleteGradingResult): GradedCardFields {
  return {
    // Card identification
    card_name: result.card_details.card_name || null,
    card_set: result.card_details.card_set || null,
    card_number: result.card_details.card_number || null,
    year: result.card_details.year || null,

    // AI Grading scores
    ai_centering_score: result.grading.individual_scores.centering,
    ai_corners_score: result.grading.individual_scores.corners,
    ai_edges_score: result.grading.individual_scores.edges,
    ai_surface_score: result.grading.individual_scores.surface,
    ai_total_score: result.grading.total_points,
    ai_grade: result.grading.numeric_grade,
    ai_label: result.grading.final_grade,

    // Market data
    estimated_value: result.market_data.estimated_value || null,
    last_comp_date: result.market_data.last_sale_date || null,
  };
}

/**
 * Fields for Quick Add cards in mntyx (no grading scores)
 */
export interface QuickAddCardFields {
  // Grading status
  is_ai_graded: false;

  // Card identification
  card_name: string | null;
  card_set: string | null;
  card_number: string | null;
  year: number | null;

  // Extended card details
  brand: string | null;
  sport_or_category: string | null;
  player_name: string | null;
  character_name: string | null;
  variant: string | null;
  is_rookie: boolean;
  is_numbered: boolean;
  serial_number: string | null;
  is_autographed: boolean;
  is_memorabilia: boolean;
  rarity: string | null;

  // Market data (raw values only)
  raw_value: number | null;
  estimated_value: number | null;  // Same as raw_value for ungraded
  last_comp_date: string | null;

  // Confidence scores
  identification_confidence: number | null;
  pricing_confidence: number | null;
}

/**
 * Helper function to map Quick Add result to mntyx GradedCard fields
 *
 * Usage in mntyx:
 * ```typescript
 * import { QuickAddResult, mapQuickAddToCardFields } from '@mnty/grading-agents';
 *
 * const result: QuickAddResult = await quickAddCard(images);
 * const cardFields = mapQuickAddToCardFields(result);
 *
 * await supabase.from('graded_cards').insert({
 *   user_id,
 *   images,
 *   ...cardFields
 * });
 * ```
 */
export function mapQuickAddToCardFields(result: QuickAddResult): QuickAddCardFields {
  return {
    // Grading status
    is_ai_graded: false,

    // Card identification
    card_name: result.card_details.card_name || null,
    card_set: result.card_details.card_set || null,
    card_number: result.card_details.card_number || null,
    year: result.card_details.year || null,

    // Extended card details
    brand: result.card_details.brand || null,
    sport_or_category: result.card_details.sport_or_category || null,
    player_name: result.card_details.player_name || null,
    character_name: result.card_details.character_name || null,
    variant: result.card_details.variant || null,
    is_rookie: result.card_details.is_rookie || false,
    is_numbered: result.card_details.is_numbered || false,
    serial_number: result.card_details.serial_number || null,
    is_autographed: result.card_details.is_autographed || false,
    is_memorabilia: result.card_details.is_memorabilia || false,
    rarity: result.card_details.rarity || null,

    // Market data (raw values)
    raw_value: result.market_data.raw_value || null,
    estimated_value: result.market_data.raw_value || null,  // Use raw value as estimate
    last_comp_date: result.market_data.last_sale_date || null,

    // Confidence scores
    identification_confidence: result.metadata.identification_confidence || null,
    pricing_confidence: result.metadata.pricing_confidence || null,
  };
}

/**
 * JSON Schema for validation
 * Can be used with libraries like Zod or Ajv for runtime validation
 */
export const GRADING_RESULT_SCHEMA = {
  type: 'object',
  required: ['grading', 'card_details', 'market_data', 'metadata'],
  properties: {
    grading: {
      type: 'object',
      required: ['final_grade', 'numeric_grade', 'confidence', 'individual_scores', 'total_points', 'human_review_needed', 'reasoning'],
      properties: {
        final_grade: { type: 'string' },
        numeric_grade: { type: 'number', minimum: 1, maximum: 10 },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        individual_scores: {
          type: 'object',
          required: ['centering', 'corners', 'edges', 'surface'],
          properties: {
            centering: { type: 'number', minimum: 0, maximum: 250 },
            corners: { type: 'number', minimum: 0, maximum: 250 },
            edges: { type: 'number', minimum: 0, maximum: 250 },
            surface: { type: 'number', minimum: 0, maximum: 250 },
          },
        },
        total_points: { type: 'number', minimum: 0, maximum: 1000 },
        human_review_needed: { type: 'boolean' },
        reasoning: { type: 'string' },
      },
    },
    card_details: {
      type: 'object',
      required: ['card_name', 'card_set', 'card_number', 'year', 'brand', 'sport_or_category', 'rarity'],
      properties: {
        card_name: { type: 'string' },
        card_set: { type: 'string' },
        card_number: { type: 'string' },
        year: { type: 'number' },
        brand: { type: 'string' },
        sport_or_category: { type: 'string' },
        player_name: { type: ['string', 'null'] },
        character_name: { type: ['string', 'null'] },
        variant: { type: ['string', 'null'] },
        is_rookie: { type: 'boolean' },
        is_numbered: { type: 'boolean' },
        serial_number: { type: ['string', 'null'] },
        is_autographed: { type: 'boolean' },
        is_memorabilia: { type: 'boolean' },
        rarity: { type: 'string' },
      },
    },
    market_data: {
      type: 'object',
      required: ['estimated_value', 'value_range_low', 'value_range_high', 'raw_value', 'price_trend'],
      properties: {
        estimated_value: { type: 'number' },
        value_range_low: { type: 'number' },
        value_range_high: { type: 'number' },
        raw_value: { type: 'number' },
        price_trend: { type: 'string', enum: ['rising', 'stable', 'declining'] },
        last_sale_price: { type: ['number', 'null'] },
        last_sale_date: { type: ['string', 'null'] },
        comparable_sales: { type: 'array' },
        population_report: { type: 'object' },
      },
    },
    metadata: {
      type: 'object',
      required: ['identification_confidence', 'pricing_confidence', 'notes'],
      properties: {
        identification_confidence: { type: 'number', minimum: 0, maximum: 1 },
        pricing_confidence: { type: 'number', minimum: 0, maximum: 1 },
        notes: { type: 'string' },
      },
    },
  },
} as const;

/**
 * JSON Schema for Quick Add result validation
 */
export const QUICK_ADD_RESULT_SCHEMA = {
  type: 'object',
  required: ['card_details', 'market_data', 'metadata'],
  properties: {
    card_details: {
      type: 'object',
      required: ['card_name', 'card_set', 'card_number', 'year', 'brand', 'sport_or_category', 'rarity'],
      properties: {
        card_name: { type: 'string' },
        card_set: { type: 'string' },
        card_number: { type: 'string' },
        year: { type: 'number' },
        brand: { type: 'string' },
        sport_or_category: { type: 'string' },
        player_name: { type: ['string', 'null'] },
        character_name: { type: ['string', 'null'] },
        variant: { type: ['string', 'null'] },
        is_rookie: { type: 'boolean' },
        is_numbered: { type: 'boolean' },
        serial_number: { type: ['string', 'null'] },
        is_autographed: { type: 'boolean' },
        is_memorabilia: { type: 'boolean' },
        rarity: { type: 'string' },
      },
    },
    market_data: {
      type: 'object',
      required: ['raw_value', 'raw_value_range_low', 'raw_value_range_high', 'price_trend'],
      properties: {
        raw_value: { type: 'number' },
        raw_value_range_low: { type: 'number' },
        raw_value_range_high: { type: 'number' },
        price_trend: { type: 'string', enum: ['rising', 'stable', 'declining'] },
        last_sale_price: { type: ['number', 'null'] },
        last_sale_date: { type: ['string', 'null'] },
        graded_value_hint: {
          type: 'object',
          properties: {
            psa_10_estimate: { type: ['number', 'null'] },
            psa_9_estimate: { type: ['number', 'null'] },
            note: { type: 'string' },
          },
        },
        comparable_sales: { type: 'array' },
        population_report: { type: 'object' },
      },
    },
    metadata: {
      type: 'object',
      required: ['identification_confidence', 'pricing_confidence', 'notes', 'upgrade_suggestion'],
      properties: {
        identification_confidence: { type: 'number', minimum: 0, maximum: 1 },
        pricing_confidence: { type: 'number', minimum: 0, maximum: 1 },
        notes: { type: 'string' },
        upgrade_suggestion: { type: 'string' },
      },
    },
  },
} as const;
