// screens/moodTracker/MoodAnalyticsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MoodAnalyticsChart from '../../components/moodTracker/MoodAnalyticsChart';
import MoodExportButton from '../../components/moodTracker/MoodExportButton';
import { useMoodAnalytics } from '../../hooks/moodTracker/useMoodAnalytics';
import { getPreviousMonths } from '../../utils/dateUtils';
import { MoodFilters } from '../../types/Mood';

const MoodAnalyticsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('1month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { 
    analytics, 
    isLoading, 
    error,
    refresh, // Use refresh instead of fetchAnalytics
    updateFilters // Use updateFilters to apply filters
  } = useMoodAnalytics();

  // Fetch analytics on component mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Convert filter to API params
  const getDateRangeFromFilter = (): MoodFilters | undefined => {
    const today = new Date();
    
    switch (activeFilter) {
      case '1week':
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        return { 
          startDate: lastWeek.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0] 
        };
      case '1month':
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        return { 
          startDate: lastMonth.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0] 
        };
      case '3months':
        const last3Months = new Date(today);
        last3Months.setMonth(today.getMonth() - 3);
        return { 
          startDate: last3Months.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0] 
        };
      case '6months':
        const last6Months = new Date(today);
        last6Months.setMonth(today.getMonth() - 6);
        return { 
          startDate: last6Months.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0] 
        };
      case 'all':
      default:
        return undefined;
    }
  };

  // Apply filter and fetch data
  const applyFilter = (filter: string) => {
    setActiveFilter(filter);
    setIsFilterOpen(false);
    if (filter === 'all') {
      updateFilters({});
    } else {
      updateFilters(getDateRangeFromFilter() || {});
    }
    refresh();
  };

  const onRefresh = useCallback(() => {
    if (activeFilter === 'all') {
      updateFilters({});
    } else {
      updateFilters(getDateRangeFromFilter() || {});
    }
    refresh();
  }, [refresh, activeFilter, updateFilters]);

  // Render filter menu
  const renderFilterMenu = () => {
    const filterOptions = [
      { id: '1week', label: 'Last Week' },
      { id: '1month', label: 'Last Month' },
      { id: '3months', label: 'Last 3 Months' },
      { id: '6months', label: 'Last 6 Months' },
      { id: 'all', label: 'All Time' },
    ];
    
    return (
      <View style={styles.filterMenu}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterOption,
              activeFilter === option.id && styles.activeFilterOption
            ]}
            onPress={() => applyFilter(option.id)}
          >
            <Text 
              style={[
                styles.filterText,
                activeFilter === option.id && styles.activeFilterText
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood Analytics</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Feather name="filter" size={20} color="#333" />
          </TouchableOpacity>
          <MoodExportButton 
            filters={getDateRangeFromFilter()} 
            buttonStyle={styles.exportButton}
          />
        </View>
      </View>

      {isFilterOpen && renderFilterMenu()}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={['#002D62']}
            tintColor="#002D62"
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                updateFilters({}); // Reset filters instead of clearError
                refresh();
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MoodAnalyticsChart 
            analytics={analytics}
            isLoading={isLoading}
            error={error}
          />
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Mood Tracking</Text>
          <Text style={styles.infoText}>
            Regular mood tracking helps you understand patterns in your mental health. 
            By logging your moods consistently, you can identify triggers and develop 
            strategies to improve your wellbeing.
          </Text>
          
          <Text style={styles.infoSubtitle}>Tips for Effective Tracking</Text>
          <View style={styles.tipItem}>
            <Feather name="check-circle" size={16} color="#002D62" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Log your mood at consistent times each day
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Feather name="check-circle" size={16} color="#002D62" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Note activities that may be affecting your mood
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Feather name="check-circle" size={16} color="#002D62" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Look for patterns over weeks and months
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Feather name="check-circle" size={16} color="#002D62" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Share insights with your therapist
            </Text>
          </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  exportButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  filterMenu: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    padding: 10,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 5,
  },
  activeFilterOption: {
    backgroundColor: '#E4F0F6',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterText: {
    fontWeight: '600',
    color: '#002D62',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#002D62',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 16,
  },
  infoSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});

export default MoodAnalyticsScreen;