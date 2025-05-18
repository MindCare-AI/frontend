// screens/moodTracker/MoodTracker.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LineChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import { useMoodLogs } from '../../hooks/moodTracker/useMoodLogs';
import { useMoodAnalytics } from '../../hooks/moodTracker/useMoodAnalytics';
import { MoodTrackerParamList } from '../../navigation/types';
import { MoodLog } from '../../types/Mood';
import { getMoodColor } from '../../utils/constants';
import { formatDate } from '../../utils/dateUtils';
import MoodHistoryItem from '../../components/moodTracker/MoodHistoryItem';
import MoodExportButton from '../../components/moodTracker/MoodExportButton';

const { width } = Dimensions.get('window');

type MoodTrackerNavigationProp = StackNavigationProp<MoodTrackerParamList, 'MoodHome'>;

const MoodTracker: React.FC = () => {
  const navigation = useNavigation<MoodTrackerNavigationProp>();
  const { 
    logs: moodLogs, // Renamed to maintain existing variable name
    isLoading: logsLoading,
    error: logsError,
    refresh: fetchLogs, // Use refresh instead of fetchLogs
    deleteLog // Use deleteLog instead of deleteMoodLog 
  } = useMoodLogs();
  
  const { 
    analytics, 
    isLoading: analyticsLoading,
    error: analyticsError,
    refresh: fetchAnalytics // Use refresh instead of fetchAnalytics
  } = useMoodAnalytics();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([fetchLogs(), fetchAnalytics()]);
    } catch (error) {
      console.error("Error loading mood data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogMood = () => {
    navigation.navigate('LogMood', {});
  };
  
  const handleViewAllLogs = () => {
    navigation.navigate('MoodHistory');
  };
  
  const handleViewAnalytics = () => {
    navigation.navigate('MoodAnalytics');
  };

  const renderMoodSummary = () => {
    if (analyticsLoading || !analytics) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#002D62" />
          <Text style={styles.loadingText}>Loading mood data...</Text>
        </View>
      );
    }

    if (analyticsError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to load mood summary
          </Text>
        </View>
      );
    }

    const weeklyAvgColor = getMoodColor(Math.round(analytics.weekly_average));
    const monthlyAvgColor = getMoodColor(Math.round(analytics.monthly_average));

    const hasChartData = analytics.daily_trends && analytics.daily_trends.length > 0;
    
    const chartData = hasChartData ? {
      labels: analytics.daily_trends.slice(-7).map(trend => {
        const date = new Date(trend.day);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: analytics.daily_trends.slice(-7).map(trend => trend.avg_mood),
          color: (opacity = 1) => `rgba(0, 45, 98, ${opacity})`,
          strokeWidth: 2
        }
      ]
    } : {
      labels: ['No Data'],
      datasets: [{ data: [0], color: () => 'rgba(0,0,0,0.1)', strokeWidth: 0 }]
    };

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.averagesContainer}>
          <View style={styles.averageBox}>
            <Text style={styles.averageLabel}>Weekly Average</Text>
            <Text style={[styles.averageValue, { color: weeklyAvgColor }]}>
              {analytics.weekly_average.toFixed(1)}
            </Text>
          </View>
          <View style={styles.averageBox}>
            <Text style={styles.averageLabel}>Monthly Average</Text>
            <Text style={[styles.averageValue, { color: monthlyAvgColor }]}>
              {analytics.monthly_average.toFixed(1)}
            </Text>
          </View>
          <View style={styles.averageBox}>
            <Text style={styles.averageLabel}>Total Entries</Text>
            <Text style={styles.averageValue}>{analytics.entry_count}</Text>
          </View>
        </View>

        {hasChartData ? (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Recent Mood Trend</Text>
            <LineChart
              data={chartData}
              width={width - 40}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 45, 98, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#002D62'
                },
                propsForLabels: {
                  fontSize: 10,
                }
              }}
              bezier
              style={styles.chart}
              withVerticalLines={false}
              withHorizontalLines={true}
            />
          </View>
        ) : (
          <View style={styles.noChartDataContainer}>
            <Text style={styles.noChartDataText}>
              Not enough data to display mood trends.
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={handleViewAnalytics}
        >
          <Text style={styles.viewAllButtonText}>View Analytics</Text>
          <Feather name="chevron-right" size={18} color="#002D62" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRecentLogs = () => {
    if (logsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#002D62" />
          <Text style={styles.loadingText}>Loading recent logs...</Text>
        </View>
      );
    }

    if (logsError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to load mood logs
          </Text>
        </View>
      );
    }

    if (moodLogs.length === 0) {
      return (
        <View style={styles.emptyLogsContainer}>
          <Text style={styles.emptyLogsText}>
            You haven't logged any moods yet.
          </Text>
        </View>
      );
    }

    // Display the most recent 3 logs
    const recentLogs = moodLogs.slice(0, 3);

    return (
      <View style={styles.recentLogsContainer}>
        {recentLogs.map((log) => (
          <MoodHistoryItem
            key={log.id}
            item={log}
            onDelete={async (id) => {
              await deleteLog(id);
            }}
            onEdit={(log) => navigation.navigate('LogMood', { moodId: log.id })}
          />
        ))}
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={handleViewAllLogs}
        >
          <Text style={styles.viewAllButtonText}>View All Logs</Text>
          <Feather name="chevron-right" size={18} color="#002D62" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood Tracker</Text>
        <MoodExportButton 
          buttonStyle={styles.exportButton} 
          textStyle={styles.exportButtonText}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#002D62']}
            tintColor="#002D62"
          />
        }
      >
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.logMoodButton}
            onPress={handleLogMood}
            activeOpacity={0.8}
          >
            <Feather name="plus-circle" size={24} color="#fff" />
            <Text style={styles.logMoodText}>Log Your Mood</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Summary</Text>
          {renderMoodSummary()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          {renderRecentLogs()}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Mood Tracking Tips</Text>
          <Text style={styles.tipsText}>
            Try to log your mood at consistent times each day for the most accurate tracking.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  exportButton: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  exportButtonText: {
    color: '#002D62',
  },
  scrollContent: {
    padding: 16,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  logMoodButton: {
    backgroundColor: '#002D62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
  },
  logMoodText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  averagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  averageBox: {
    flex: 1,
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002D62',
  },
  chartContainer: {
    marginVertical: 8,
  },
  chartTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noChartDataContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 8,
  },
  noChartDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recentLogsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  viewAllButtonText: {
    color: '#002D62',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyLogsContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  emptyLogsText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#e4f0f6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default MoodTracker;