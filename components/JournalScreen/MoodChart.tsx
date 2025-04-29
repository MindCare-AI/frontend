import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { JournalEntry, Mood } from '../../types/journal';
import { formatDate } from '../../utils/dateUtils';

interface MoodChartProps {
  entries: JournalEntry[];
  loading?: boolean;
  period?: 'week' | 'month' | 'year';
  title?: string;
}

const MoodChart: React.FC<MoodChartProps> = ({
  entries,
  loading = false,
  period = 'week',
  title = 'Mood Trends'
}) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({
    labels: [],
    datasets: [{ data: [] }]
  });

  // Convert mood to numerical value for chart
  const moodToValue = (mood: Mood): number => {
    const moodValues: Record<Mood, number> = {
      'very_negative': 1,
      'negative': 2,
      'neutral': 3,
      'positive': 4,
      'very_positive': 5
    };
    return moodValues[mood];
  };

  // Convert numerical value back to mood label
  const valueToMoodLabel = (value: number): string => {
    switch(value) {
      case 1: return 'Very Negative';
      case 2: return 'Negative';
      case 3: return 'Neutral';
      case 4: return 'Positive';
      case 5: return 'Very Positive';
      default: return '';
    }
  };

  useEffect(() => {
    if (!loading && entries.length > 0) {
      // Sort entries by date
      const sortedEntries = [...entries].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Limit the number of entries based on the period
      const limitedEntries = period === 'week' 
        ? sortedEntries.slice(-7) 
        : period === 'month' 
          ? sortedEntries.slice(-30) 
          : sortedEntries.slice(-365);

      // Format dates for x-axis labels
      const labels = limitedEntries.map(entry => {
        const date = new Date(entry.date);
        return period === 'week' 
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      // Map moods to numerical values
      const moodData = limitedEntries.map(entry => moodToValue(entry.mood));

      setChartData({
        labels,
        datasets: [{ data: moodData }]
      });
    } else if (!loading && entries.length === 0) {
      // No data
      setChartData({
        labels: ['No data'],
        datasets: [{ data: [0] }]
      });
    }
  }, [entries, loading, period]);

  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#1976d2'
    },
    propsForLabels: {
      fontSize: 10,
    },
    // Customize y-axis to show mood labels
    formatYLabel: (value: string) => {
      const numValue = Number(value);
      if (numValue >= 1 && numValue <= 5) {
        return valueToMoodLabel(numValue).charAt(0);
      }
      return '';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading mood data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {entries.length > 0 ? (
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero={true}
            yAxisSuffix=""
            yAxisInterval={1}
            segments={4}
            withInnerLines={true}
            withVerticalLines={false}
            yLabelsOffset={15}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No journal entries recorded yet</Text>
          </View>
        )}
      </View>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#e53935' }]} />
          <Text style={styles.legendText}>Very Negative</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f4511e' }]} />
          <Text style={styles.legendText}>Negative</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#9e9e9e' }]} />
          <Text style={styles.legendText}>Neutral</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#8bc34a' }]} />
          <Text style={styles.legendText}>Positive</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#43a047' }]} />
          <Text style={styles.legendText}>Very Positive</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  noDataContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#666666',
  }
});

export default MoodChart;