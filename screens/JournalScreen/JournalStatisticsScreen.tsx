import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useJournal } from '../../contexts/JournalContext';
import MoodChart from '../../components/JournalScreen/MoodChart';
import { JournalEntry, JournalStatistics, Mood } from '../../types/journal';
import { getPreviousMonths } from '../../utils/dateUtils';

// Colors for mood categories
const moodColors = {
  very_negative: '#E53935',
  negative: '#FB8C00',
  neutral: '#9E9E9E',
  positive: '#8BC34A',
  very_positive: '#43A047',
};

const JournalStatisticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { entries, statistics, fetchStats, loading } = useJournal();
  
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [moodDistribution, setMoodDistribution] = useState<any[]>([]);
  const [activityStats, setActivityStats] = useState<any[]>([]);
  const [monthlyEntryData, setMonthlyEntryData] = useState({
    labels: [''],
    datasets: [{ data: [0] }],
  });

  // Fetch statistics when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  // Calculate mood distribution from entries
  useEffect(() => {
    if (entries.length > 0) {
      const moodCounts: Record<Mood, number> = {
        very_negative: 0,
        negative: 0,
        neutral: 0,
        positive: 0,
        very_positive: 0,
      };
      
      // Count entries by mood
      entries.forEach(entry => {
        moodCounts[entry.mood]++;
      });
      
      // Transform to format needed for PieChart
      const moodData = Object.keys(moodCounts).map(mood => ({
        name: mood.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: moodCounts[mood as Mood],
        color: moodColors[mood as Mood],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      })).filter(item => item.count > 0);
      
      setMoodDistribution(moodData);
      
      // Calculate activity statistics
      const activityCount: Record<string, number> = {};
      
      entries.forEach(entry => {
        if (entry.activities) {
          const activities = entry.activities.split(',');
          activities.forEach(activity => {
            const trimmedActivity = activity.trim();
            activityCount[trimmedActivity] = (activityCount[trimmedActivity] || 0) + 1;
          });
        }
      });
      
      const topActivities = Object.keys(activityCount)
        .map(activity => ({ name: activity, count: activityCount[activity] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((item, index) => ({
          ...item,
          color: `hsl(${index * 50}, 70%, 60%)`,
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        }));
      
      setActivityStats(topActivities);
      
      // Calculate monthly entry counts
      const months = getPreviousMonths(6);
      const labels = months.map(month => month.label.substring(0, 3));
      
      const monthlyCounts = months.map(month => {
        return entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= new Date(month.startDate) && entryDate <= new Date(month.endDate);
        }).length;
      });
      
      setMonthlyEntryData({
        labels,
        datasets: [{ data: monthlyCounts }]
      });
    }
  }, [entries]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal Statistics</Text>
      </View>

      <View style={styles.overviewContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{entries.length}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics?.entries_this_month || 0}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics?.average_word_count || 0}</Text>
            <Text style={styles.statLabel}>Avg. Words</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {entries.filter(e => e.shared_with_therapist).length}
            </Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
        </View>
      </View>

      <View style={styles.moodTrendsContainer}>
        <Text style={styles.sectionTitle}>Mood Trends</Text>
        
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, chartPeriod === 'week' && styles.activePeriod]}
            onPress={() => setChartPeriod('week')}
          >
            <Text style={[styles.periodButtonText, chartPeriod === 'week' && styles.activePeriodText]}>
              Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.periodButton, chartPeriod === 'month' && styles.activePeriod]}
            onPress={() => setChartPeriod('month')}
          >
            <Text style={[styles.periodButtonText, chartPeriod === 'month' && styles.activePeriodText]}>
              Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.periodButton, chartPeriod === 'year' && styles.activePeriod]}
            onPress={() => setChartPeriod('year')}
          >
            <Text style={[styles.periodButtonText, chartPeriod === 'year' && styles.activePeriodText]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>
        
        <MoodChart entries={entries} period={chartPeriod} loading={loading} />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Mood Distribution</Text>
        
        {moodDistribution.length > 0 ? (
          <PieChart
            data={moodDistribution}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No mood data available</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Monthly Entries</Text>
        
        {monthlyEntryData.datasets[0].data.some(d => d > 0) ? (
          <BarChart
            data={monthlyEntryData}
            width={Dimensions.get('window').width - 32}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            showValuesOnTopOfBars
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No monthly data available</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Top Activities</Text>
        
        {activityStats.length > 0 ? (
          <PieChart
            data={activityStats}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No activity data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  overviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  moodTrendsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 25,
  },
  activePeriod: {
    backgroundColor: '#1976d2',
  },
  periodButtonText: {
    color: '#666',
  },
  activePeriodText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
  },
});

export default JournalStatisticsScreen;