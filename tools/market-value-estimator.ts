// tools/market-value-estimator.ts
import { defineTool } from '@mastra/core';
import { z } from 'zod';

/**
 * Market Value Estimator Tool
 * Estimates market value based on grade and card type
 */
export const marketValueEstimatorTool = defineTool({
  id: 'estimate-market-value',
  name: 'Market Value Estimator',
  description: 'Estimates market value of card based on grade',
  
  input: z.object({
    grade: z.number().min(0.5).max(10),
    card_type: z.enum(['pokemon', 'sports', 'mtg', 'yugioh', 'other']).optional(),
    card_year: z.number().optional(),
    is_rookie: z.boolean().optional(),
    is_holo: z.boolean().optional(),
  }),
  
  output: z.object({
    estimated_value_usd: z.number(),
    value_range: z.object({
      min: z.number(),
      max: z.number(),
    }),
    multiplier: z.number().describe('Grade multiplier vs base value'),
    market_notes: z.array(z.string()),
  }),
  
  execute: async ({ grade, card_type = 'other', card_year, is_rookie = false, is_holo = false }) => {
    // Grade multipliers (how much value increases per grade)
    const gradeMultipliers: { [key: number]: number } = {
      10: 10.0,  // Gem Mint 10 - 10x base value
      9: 4.0,    // Mint 9 - 4x base value
      8: 2.0,    // NM-MT 8 - 2x base value
      7: 1.2,    // NM 7 - 1.2x base value
      6: 0.8,    // EX-MT 6 - 0.8x base value
      5: 0.5,    // EX 5 - 0.5x base value
      4: 0.3,    // VG-EX 4 - 0.3x base value
      3: 0.2,    // VG 3 - 0.2x base value
      2: 0.1,    // Good 2 - 0.1x base value
      1: 0.05,   // Fair 1 - 0.05x base value
      0.5: 0.02, // Poor - 0.02x base value
    };
    
    const multiplier = gradeMultipliers[grade] || 1.0;
    
    // Base value estimates (very rough - real implementation would query actual market data)
    let baseValue = 5; // $5 base
    
    // Adjust for card type
    if (card_type === 'pokemon' && is_holo) baseValue = 15;
    if (card_type === 'sports' && is_rookie) baseValue = 25;
    if (card_type === 'mtg') baseValue = 20;
    
    // Adjust for age (older cards worth more if in good condition)
    if (card_year && card_year < 2000 && grade >= 8) {
      baseValue *= 2;
    }
    
    // Calculate estimated value
    const estimated_value = Math.round(baseValue * multiplier * 100) / 100;
    
    // Value range (±30%)
    const value_range = {
      min: Math.round(estimated_value * 0.7 * 100) / 100,
      max: Math.round(estimated_value * 1.3 * 100) / 100,
    };
    
    // Market notes
    const market_notes: string[] = [];
    
    if (grade === 10) {
      market_notes.push('Gem Mint 10 cards command significant premium in market');
    }
    if (grade >= 9) {
      market_notes.push('High-grade cards are in high demand from collectors');
    }
    if (grade <= 5) {
      market_notes.push('Lower grade cards have limited collector appeal');
    }
    if (is_rookie && card_type === 'sports') {
      market_notes.push('Rookie cards maintain strong value across all grades');
    }
    if (is_holo && card_type === 'pokemon') {
      market_notes.push('Holographic Pokemon cards are premium collectibles');
    }
    
    return {
      estimated_value_usd: estimated_value,
      value_range,
      multiplier,
      market_notes,
    };
  },
});
