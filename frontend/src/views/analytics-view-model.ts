type TrendPoint = {
  date: string
  count: number
}

type AnalyticsSummary = {
  totalPlans: number
  totalPublished: number
  totalDrafts: number
  publishedRate: number
  avgDuration: number
  publishRate: number
  qualityScore: number
  periodStats: {
    newPlans: number
    published: number
    updated: number
  }
}

const asNumber = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

export const normalizeTrendPoints = (trendData: unknown): TrendPoint[] => {
  const source = Array.isArray((trendData as { monthlyTrend?: unknown[] })?.monthlyTrend)
    ? (trendData as { monthlyTrend: unknown[] }).monthlyTrend
    : Array.isArray(trendData)
      ? trendData
      : []

  return source.map((item) => {
    const record = item as Record<string, unknown>
    return {
      date: typeof record.month === 'string' ? record.month : typeof record.date === 'string' ? record.date : '',
      count: asNumber(record.count),
    }
  })
}

const extractWorkload = (workload: unknown): { totalPlans: number; totalDuration: number } => {
  if (workload && typeof workload === 'object' && !Array.isArray(workload)) {
    const record = workload as Record<string, unknown>
    return {
      totalPlans: asNumber(record.totalPlans),
      totalDuration: asNumber(record.totalDuration),
    }
  }

  const rows = Array.isArray(workload) ? workload : []
  const first = (rows[0] || {}) as Record<string, unknown>
  return {
    totalPlans: asNumber(first.planCount) || rows.length,
    totalDuration: asNumber(first.totalDuration),
  }
}

const extractExecution = (execution: unknown): { draft: number; published: number; archived: number } => {
  if (execution && typeof execution === 'object' && !Array.isArray(execution)) {
    const distribution = (execution as { statusDistribution?: Record<string, unknown> }).statusDistribution || {}
    return {
      draft: asNumber(distribution.DRAFT),
      published: asNumber(distribution.PUBLISHED),
      archived: asNumber(distribution.ARCHIVED),
    }
  }

  const rows = Array.isArray(execution) ? execution : []
  let draft = 0
  let published = 0
  let archived = 0

  rows.forEach((row) => {
    const record = row as Record<string, unknown>
    const status = String(record.status || '').toUpperCase()
    const count = asNumber(record.count) || 1
    if (status === 'DRAFT') draft += count
    if (status === 'ARCHIVED') archived += count
    if (status === 'PUBLISHED' || status === 'COMPLETED') published += count
  })

  return { draft, published, archived }
}

const extractQualityScore = (quality: unknown): number => {
  if (quality && typeof quality === 'object' && !Array.isArray(quality)) {
    const record = quality as Record<string, unknown>
    return asNumber(record.averageCompleteness) || asNumber(record.averageScore)
  }

  if (Array.isArray(quality) && quality.length > 0) {
    const first = quality[0] as Record<string, unknown>
    return asNumber(first.value) || asNumber(first.score)
  }

  return 0
}

export const buildAnalyticsSummary = (data: {
  workload?: unknown
  execution?: unknown
  quality?: unknown
  trend?: unknown
}): AnalyticsSummary => {
  const workload = extractWorkload(data.workload)
  const execution = extractExecution(data.execution)
  const trendPoints = normalizeTrendPoints(data.trend)
  const totalPlans = workload.totalPlans || execution.draft + execution.published + execution.archived
  const totalPublished = execution.published
  const totalDrafts = execution.draft
  const publishedRate = totalPlans > 0 ? Math.round((totalPublished / totalPlans) * 100) : 0
  const avgDuration = totalPlans > 0 ? Math.round(workload.totalDuration / totalPlans) : 0
  const qualityScore = extractQualityScore(data.quality)

  return {
    totalPlans,
    totalPublished,
    totalDrafts,
    publishedRate,
    avgDuration,
    publishRate: publishedRate,
    qualityScore,
    periodStats: {
      newPlans: trendPoints[trendPoints.length - 1]?.count || 0,
      published: totalPublished,
      updated: totalDrafts,
    },
  }
}
