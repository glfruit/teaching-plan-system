const API_BASE_URL = '/api';
export type AnalyticsExportFormat = 'json' | 'csv' | 'excel' | 'pdf' | 'word'

export interface TeachingChainSummary {
  totalLessons: number
  publishedLessons: number
  totalBooks: number
  totalSemesters: number
  totalCourses: number
  totalWeeks: number
  averageLessonDuration: number
  consistencyScore: number
  deliveryTraceCoverage: number
  coursewareTraceCoverage: number
}

export interface TeachingChainBySemesterItem {
  semesterId: string
  semesterName: string
  totalLessons: number
  publishedLessons: number
  consistencyScore: number
}

export interface TeachingChainByCourseItem {
  courseId: string
  courseCode: string
  courseName: string
  totalLessons: number
  publishedLessons: number
  consistencyScore: number
}

export interface TeachingChainByWeekItem {
  weekNo: number
  totalLessons: number
  publishedLessons: number
  totalDuration: number
  averageDuration: number
  consistencyScore: number
}

export interface TeachingChainAnalytics {
  summary: TeachingChainSummary
  bySemester: TeachingChainBySemesterItem[]
  byCourse: TeachingChainByCourseItem[]
  byWeek: TeachingChainByWeekItem[]
  filters: {
    semesterId?: string
    courseId?: string
    weekNo?: number
  }
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token')
  if (!token) {
    return {}
  }
  return { Authorization: `Bearer ${token}` }
}

export const getWorkload = async () => {
  const res = await fetch(`${API_BASE_URL}/analytics/workload`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch workload');
  return res.json();
};

export const getExecution = async () => {
  const res = await fetch(`${API_BASE_URL}/analytics/execution`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch execution');
  return res.json();
};

export const getQuality = async () => {
  const res = await fetch(`${API_BASE_URL}/analytics/quality`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch quality');
  return res.json();
};

export const getTrend = async () => {
  const res = await fetch(`${API_BASE_URL}/analytics/trend`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch trend');
  return res.json();
};

export const getTeachingChainAnalytics = async (params?: {
  semesterId?: string
  courseId?: string
  weekNo?: number
}): Promise<TeachingChainAnalytics> => {
  const searchParams = new URLSearchParams()
  if (params?.semesterId) {
    searchParams.set('semesterId', params.semesterId)
  }
  if (params?.courseId) {
    searchParams.set('courseId', params.courseId)
  }
  if (params?.weekNo) {
    searchParams.set('weekNo', String(params.weekNo))
  }

  const query = searchParams.toString()
  const res = await fetch(`${API_BASE_URL}/analytics/teaching-chain${query ? `?${query}` : ''}`, {
    headers: {
      ...getAuthHeaders(),
    },
  })
  if (!res.ok) throw new Error('Failed to fetch teaching-chain analytics')
  const payload = await res.json()
  return payload.data || {
    summary: {
      totalLessons: 0,
      publishedLessons: 0,
      totalBooks: 0,
      totalSemesters: 0,
      totalCourses: 0,
      totalWeeks: 0,
      averageLessonDuration: 0,
      consistencyScore: 0,
      deliveryTraceCoverage: 0,
      coursewareTraceCoverage: 0,
    },
    bySemester: [],
    byCourse: [],
    byWeek: [],
    filters: {},
  }
}

export const getAnalytics = async () => {
  const [workload, execution, quality, trend, teachingChain] = await Promise.all([
    getWorkload(),
    getExecution(),
    getQuality(),
    getTrend(),
    getTeachingChainAnalytics()
  ]);
  
  return {
    workload: workload.data || [],
    execution: execution.data || [],
    quality: quality.data || [],
    trend: trend.data || [],
    teachingChain,
  };
};

export const exportAnalytics = async (format: AnalyticsExportFormat): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/analytics/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ format }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || '导出失败')
  }

  return response.blob()
}
