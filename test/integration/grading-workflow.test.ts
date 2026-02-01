// test/integration/grading-workflow.test.ts
import { describe, it, expect, beforeAll } from '@jest/globals';
import { mastra, gradeCard } from '../../src';
import sampleCard from '../fixtures/sample-card.json';

describe('Card Grading Workflow', () => {
  beforeAll(async () => {
    // Setup test environment
    process.env.MASTRA_ENVIRONMENT = 'test';
  });

  it('should grade a card successfully', async () => {
    const result = await gradeCard(sampleCard.images);
    
    expect(result).toBeDefined();
    expect(result.qa_consensus).toBeDefined();
    expect(result.qa_consensus.final_grade).toBeDefined();
  }, 60000); // 60 second timeout

  it('should return valid scores for all components', async () => {
    const result = await gradeCard(sampleCard.images);
    const { final_grade } = result.qa_consensus;
    
    // Check score ranges
    expect(final_grade.centering).toBeGreaterThanOrEqual(0);
    expect(final_grade.centering).toBeLessThanOrEqual(250);
    
    expect(final_grade.corners).toBeGreaterThanOrEqual(0);
    expect(final_grade.corners).toBeLessThanOrEqual(250);
    
    expect(final_grade.edges).toBeGreaterThanOrEqual(0);
    expect(final_grade.edges).toBeLessThanOrEqual(250);
    
    expect(final_grade.surface).toBeGreaterThanOrEqual(0);
    expect(final_grade.surface).toBeLessThanOrEqual(250);
    
    expect(final_grade.total).toBeGreaterThanOrEqual(0);
    expect(final_grade.total).toBeLessThanOrEqual(1000);
    
    expect(final_grade.grade).toBeGreaterThanOrEqual(0.5);
    expect(final_grade.grade).toBeLessThanOrEqual(10.0);
  }, 60000);

  it('should have consistent component scores', async () => {
    const result = await gradeCard(sampleCard.images);
    const { final_grade } = result.qa_consensus;
    
    // Total should match sum of components (within tolerance)
    const calculated_total = 
      final_grade.centering +
      final_grade.corners +
      final_grade.edges +
      final_grade.surface;
    
    const difference = Math.abs(calculated_total - final_grade.total);
    expect(difference).toBeLessThanOrEqual(10);
  }, 60000);

  it('should return confidence score', async () => {
    const result = await gradeCard(sampleCard.images);
    
    expect(result.qa_consensus.confidence).toBeGreaterThanOrEqual(0);
    expect(result.qa_consensus.confidence).toBeLessThanOrEqual(1);
  }, 60000);

  it('should match expected grade range', async () => {
    const result = await gradeCard(sampleCard.images);
    const { final_grade } = result.qa_consensus;
    
    expect(final_grade.total).toBeGreaterThanOrEqual(sampleCard.expected_results.total.min);
    expect(final_grade.total).toBeLessThanOrEqual(sampleCard.expected_results.total.max);
    
    expect(final_grade.grade).toBeGreaterThanOrEqual(sampleCard.expected_results.grade.min);
    expect(final_grade.grade).toBeLessThanOrEqual(sampleCard.expected_results.grade.max);
  }, 60000);

  it('should return valid grade label', async () => {
    const result = await gradeCard(sampleCard.images);
    const { final_grade } = result.qa_consensus;
    
    const validLabels = [
      'Pristine 10',
      'Gem Mint 10',
      'Mint 9',
      'Near Mint-Mint 8',
      'Near Mint 7',
      'Excellent-Mint 6',
      'Excellent 5',
      'Very Good-Excellent 4',
      'Very Good 3',
      'Good 2',
      'Fair 1',
      'Poor',
    ];
    
    expect(validLabels).toContain(final_grade.label);
  }, 60000);

  it('should include all specialist analyses', async () => {
    const result = await gradeCard(sampleCard.images);
    
    expect(result.centering_analysis).toBeDefined();
    expect(result.corners_analysis).toBeDefined();
    expect(result.edges_analysis).toBeDefined();
    expect(result.surface_analysis).toBeDefined();
  }, 60000);

  it('should track processing time', async () => {
    const result = await gradeCard(sampleCard.images);
    
    expect(result.processing_time_ms).toBeGreaterThan(0);
    expect(result.processing_time_ms).toBeLessThan(180000); // Under 3 minutes
  }, 180000);

  it('should include timestamp', async () => {
    const result = await gradeCard(sampleCard.images);
    
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);
  }, 60000);

  it('should flag for review if confidence is low', async () => {
    // This would require a low-quality test image set
    // For now, just verify the field exists
    const result = await gradeCard(sampleCard.images);
    
    expect(result.qa_consensus.human_review_needed).toBeDefined();
    expect(typeof result.qa_consensus.human_review_needed).toBe('boolean');
  }, 60000);
});
