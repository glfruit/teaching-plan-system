import { describe, expect, test } from 'bun:test';
import { calculatePlanQuality } from '../../src/utils/quality';

describe('calculatePlanQuality', () => {
  test('should return 0 for empty plan', () => {
    const plan = {};
    const result = calculatePlanQuality(plan);
    expect(result).toEqual({
      totalScore: 0,
      maxScore: 100,
      percentage: 0
    });
  });

  test('should calculate score correctly for partial plan', () => {
    const plan = {
      objectives: 'Some objectives that are long enough', // > 10 chars (20 pts)
      keyPoints: 'Key points > 5', // > 5 chars (20 pts)
      process: 'Process description > 20 chars...', // > 20 chars (20 pts)
      // Missing other fields
    };
    
    // 20 + 20 + 20 = 60
    const result = calculatePlanQuality(plan);
    expect(result).toEqual({
      totalScore: 60,
      maxScore: 100,
      percentage: 60
    });
  });

  test('should calculate score correctly for full plan', () => {
    const plan = {
      objectives: 'Some objectives that are long enough', // 20
      keyPoints: 'Key points > 5', // 20
      process: 'Process description > 20 chars...', // 20
      reflection: 'Reflection exists', // 10
      methods: 'Methods exist', // 10
      resources: 'Resources exist', // 10
      blackboard: 'Blackboard design exists' // 10
    };
    
    // 20+20+20+10+10+10+10 = 100
    const result = calculatePlanQuality(plan);
    expect(result).toEqual({
      totalScore: 100,
      maxScore: 100,
      percentage: 100
    });
  });

  test('should handle edge cases (short content)', () => {
    const plan = {
      objectives: 'Short', // < 10 chars -> 0
      keyPoints: 'Short', // < 5 chars -> 0
      process: 'Short', // < 20 chars -> 0
      reflection: '', // empty -> 0
      methods: [], // array empty -> 0 (treated as length 0 if string/array logic is consistent)
    };
    const result = calculatePlanQuality(plan);
    expect(result.totalScore).toBe(0);
  });
  
  test('should not exceed 100 even if logic changes', () => {
      // Future proofing
      const plan = {
          objectives: 'a'.repeat(100),
          keyPoints: 'a'.repeat(100),
          process: 'a'.repeat(100),
          reflection: 'a'.repeat(100),
          methods: 'a'.repeat(100),
          resources: 'a'.repeat(100),
          blackboard: 'a'.repeat(100),
      };
      const result = calculatePlanQuality(plan);
      expect(result.totalScore).toBe(100);
      expect(result.percentage).toBe(100);
  });
});
