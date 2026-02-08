const API_BASE_URL = '/api';

export const getWorkload = async () => {
  const res = await fetch(`${API_BASE_URL}/analytics/workload`);
  if (!res.ok) throw new Error('Failed to fetch workload');
  return res.json();
};

export const getExecution = async () => {
  const res = await fetch(`${API_BASE_URL}/analytics/execution`);
  if (!res.ok) throw new Error('Failed to fetch execution');
  return res.json();
};

export const getQuality = async () => {
  const res = await fetch(`${API_BASE_URL}/analytics/quality`);
  if (!res.ok) throw new Error('Failed to fetch quality');
  return res.json();
};

export const getTrend = async () => {
  const res = await fetch(`${API_BASE_URL}/analytics/trend`);
  if (!res.ok) throw new Error('Failed to fetch trend');
  return res.json();
};

export const getAnalytics = async () => {
  const [workload, execution, quality, trend] = await Promise.all([
    getWorkload(),
    getExecution(),
    getQuality(),
    getTrend()
  ]);
  
  return {
    workload: workload.data || [],
    execution: execution.data || [],
    quality: quality.data || [],
    trend: trend.data || []
  };
};
