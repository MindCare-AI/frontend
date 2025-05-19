import { useCallback } from 'react';
import { MoodFilters } from '../../types/Mood';
import { useMoodContext } from '../../contexts/moodContext';

export const useMoodAnalytics = () => {
  const { 
    analytics, 
    isLoading, 
    error, 
    filters,
    fetchAnalytics, 
    setFilters 
  } = useMoodContext();
  
  const refreshAnalytics = useCallback(async (newFilters?: Partial<MoodFilters>) => {
    const updatedFilters = newFilters ? { ...filters, ...newFilters } : filters;
    
    if (newFilters) {
      setFilters(updatedFilters);
    }
    
    await fetchAnalytics(updatedFilters);
  }, [filters, fetchAnalytics, setFilters]);
  
  const getFormattedTrends = useCallback(() => {
    if (!analytics?.daily_trends) return [];
    
    return analytics.daily_trends.map(trend => ({
      date: new Date(trend.day),
      value: trend.avg_mood,
      label: new Date(trend.day).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
    }));
  }, [analytics]);
  
  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
    getFormattedTrends,
    weeklyAverage: analytics?.weekly_average || 0,
    monthlyAverage: analytics?.monthly_average || 0,
    entryCount: analytics?.entry_count || 0,
  };
};
