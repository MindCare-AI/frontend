// components/moodTracker/MoodAnalyticsChart.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MoodAnalytics } from '../../types/Mood';
import { getMoodColor } from '../../utils/constants';

interface MoodAnalyticsChartProps {
  analytics: MoodAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

const MoodAnalyticsChart: React.FC<MoodAnalyticsChartProps> = ({ 
  analytics, 
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D62" />
        <Text style={styles.loadingText}>Loading mood analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!analytics || !analytics.daily_trends || analytics.daily_trends.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No mood data available for this period.</Text>
      </View>
    );
  }

  // Format data for the chart
  const labels = analytics.daily_trends.map(trend => {
    // Format date as MM/DD
    const date = new Date(trend.day);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const data = analytics.daily_trends.map(trend => trend.avg_mood);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => `rgba(0, 45, 98, ${opacity})`, // Primary color
        strokeWidth: 2
      }
    ],
    legend: ['Daily Mood']
  };

  // Calculate average color based on weekly average mood
  const weeklyAvgColor = getMoodColor(Math.round(analytics.weekly_average));
  const monthlyAvgColor = getMoodColor(Math.round(analytics.monthly_average));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Average</Text>
          <Text style={[styles.summaryValue, { color: weeklyAvgColor }]}>
            {analytics.weekly_average.toFixed(1)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Monthly Average</Text>
          <Text style={[styles.summaryValue, { color: monthlyAvgColor }]}>
            {analytics.monthly_average.toFixed(1)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Entries</Text>
          <Text style={styles.summaryValue}>
            {analytics.entry_count}
          </Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Mood Trend</Text>
      
      {analytics.daily_trends.length > 1 ? (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <LineChart
            data={chartData}
            width={Math.max(Dimensions.get('window').width - 40, labels.length * 60)}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 45, 98, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '6',
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
            fromZero={true}
            yAxisSuffix=""
            yAxisInterval={1}
          />
        </ScrollView>
      ) : (
        <View style={styles.noTrendContainer}>
          <Text style={styles.noTrendText}>
            Need more data points to display trend chart.
          </Text>
        </View>
      )}

      <View style={styles.ratingGuide}>
        <Text style={styles.ratingGuideTitle}>Mood Rating Guide</Text>
        <View style={styles.ratingRow}>
          <View style={[styles.ratingDot, { backgroundColor: getMoodColor(1) }]} />
          <Text style={styles.ratingText}>1-2: Very Poor</Text>
        </View>
        <View style={styles.ratingRow}>
          <View style={[styles.ratingDot, { backgroundColor: getMoodColor(3) }]} />
          <Text style={styles.ratingText}>3-4: Poor</Text>
        </View>
        <View style={styles.ratingRow}>
          <View style={[styles.ratingDot, { backgroundColor: getMoodColor(5) }]} />
          <Text style={styles.ratingText}>5-6: Average</Text>
        </View>
        <View style={styles.ratingRow}>
          <View style={[styles.ratingDot, { backgroundColor: getMoodColor(7) }]} />
          <Text style={styles.ratingText}>7-8: Good</Text>
        </View>
        <View style={styles.ratingRow}>
          <View style={[styles.ratingDot, { backgroundColor: getMoodColor(10) }]} />
          <Text style={styles.ratingText}>9-10: Excellent</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002D62',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  noTrendContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginHorizontal: 10,
    marginVertical: 8,
  },
  noTrendText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  ratingGuide: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  ratingGuideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
  },
});

export default MoodAnalyticsChart;