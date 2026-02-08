export interface PlanWithContent {
  objectives?: string | null;
  keyPoints?: string | null;
  process?: string | null;
  reflection?: string | null;
  methods?: string | null;
  resources?: string | null;
  blackboard?: string | null;
}

export interface QualityScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
}

/**
 * Calculate the quality score of a teaching plan based on content completeness.
 * 
 * Algorithm (Total 100):
 * - Objectives > 10 chars: +20
 * - KeyPoints > 5 chars: +20
 * - Process > 20 chars: +20
 * - Reflection > 0 chars: +10
 * - Methods > 0 chars: +10
 * - Resources > 0 chars: +10
 * - Blackboard > 0 chars: +10
 */
export function calculatePlanQuality(plan: PlanWithContent): QualityScore {
  let score = 0;
  const maxScore = 100;

  // Essential fields
  if (plan.objectives && plan.objectives.length > 10) score += 20;
  if (plan.keyPoints && plan.keyPoints.length > 5) score += 20;
  if (plan.process && plan.process.length > 20) score += 20;

  // Optional/Advanced fields
  if (plan.reflection && plan.reflection.length > 0) score += 10;
  if (plan.methods && plan.methods.length > 0) score += 10;
  if (plan.resources && plan.resources.length > 0) score += 10;
  if (plan.blackboard && plan.blackboard.length > 0) score += 10;

  // Cap at 100 just in case logic changes slightly or inputs are weird
  const totalScore = Math.min(score, maxScore);

  return {
    totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100)
  };
}
