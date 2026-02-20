import { describe, expect, it } from 'vitest'
import { buildAnalyticsSummary, normalizeTrendPoints } from './analytics-view-model'

describe('analytics-view-model', () => {
  it('builds summary from object-based analytics payload', () => {
    const result = buildAnalyticsSummary({
      workload: { totalPlans: 3, totalDuration: 180 },
      execution: { statusDistribution: { DRAFT: 1, PUBLISHED: 2, ARCHIVED: 0 } },
      quality: { averageCompleteness: 92 },
      trend: { monthlyTrend: [{ month: '2026-02', count: 2 }, { month: '2026-03', count: 1 }] },
    })

    expect(result.totalPlans).toBe(3)
    expect(result.totalPublished).toBe(2)
    expect(result.totalDrafts).toBe(1)
    expect(result.publishedRate).toBe(67)
    expect(result.avgDuration).toBe(60)
    expect(result.publishRate).toBe(67)
    expect(result.periodStats.newPlans).toBe(1)
    expect(result.qualityScore).toBe(92)
  })

  it('builds summary from legacy array-based analytics payload', () => {
    const result = buildAnalyticsSummary({
      workload: [{ teacherId: 't1', planCount: 4 }],
      execution: [{ status: 'completed', count: 3 }, { status: 'draft', count: 1 }],
      quality: [],
      trend: [{ date: '2026-03-01', count: 2 }],
    })

    expect(result.totalPlans).toBe(4)
    expect(result.totalPublished).toBe(3)
    expect(result.totalDrafts).toBe(1)
    expect(result.publishedRate).toBe(75)
    expect(result.publishRate).toBe(75)
    expect(result.periodStats.newPlans).toBe(2)
  })

  it('normalizes trend points from month/date fields', () => {
    const points = normalizeTrendPoints({
      monthlyTrend: [{ month: '2026-01', count: 1 }, { month: '2026-02', count: 2 }],
    })

    expect(points).toEqual([
      { date: '2026-01', count: 1 },
      { date: '2026-02', count: 2 },
    ])
  })
})
