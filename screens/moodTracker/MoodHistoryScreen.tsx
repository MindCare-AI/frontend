// screens/moodTracker/MoodHistoryScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MoodHistoryItem from '../../components/moodTracker/MoodHistoryItem';
import { useMoodLogs } from '../../hooks/moodTracker/useMoodLogs';
import { MoodLog } from '../../types/Mood';
import { formatDate } from '../../utils/dateUtils';

const MoodHistoryScreen: React.FC = () => {
  const { 
    logs, // Use logs instead of moodLogs
    isLoading, 
    error, 
    refresh, // Use refresh instead of fetchMoodLogs
    deleteLog, // Use deleteLog instead of deleteMoodLog
    applyFilters // Use applyFilters instead of clearError
  } = useMoodLogs();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterRange, setFilterRange] = useState({ min: 1, max: 10 });

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Filter mood logs based on search query and mood rating range
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      (log.activities && log.activities.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMoodRange = log.mood_rating >= filterRange.min && 
      log.mood_rating <= filterRange.max;
    
    return matchesSearch && matchesMoodRange;
  });

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="calendar" size={50} color="#ccc" />
      <Text style={styles.emptyStateText}>
        {error 
          ? 'Error loading mood logs'
          : isLoading
          ? 'Loading your mood history...'
          : 'No mood logs found'}
      </Text>
      {error && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            applyFilters({}); // Reset filters instead of clearError
            refresh();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFilterSection = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Filter by Mood Rating</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderValue}>{filterRange.min}</Text>
        <View style={styles.sliderTrack}>
          {/* This is a simplified slider UI. You can use a proper slider component here */}
          <TouchableOpacity 
            style={[styles.sliderThumb, { left: `${(filterRange.min - 1) * 10}%` }]}
            onPress={() => setFilterRange({...filterRange, min: Math.min(filterRange.min + 1, filterRange.max)})}
          />
          <TouchableOpacity 
            style={[styles.sliderThumb, { left: `${(filterRange.max - 1) * 10}%` }]}
            onPress={() => setFilterRange({...filterRange, max: Math.max(filterRange.max - 1, filterRange.min)})}
          />
        </View>
        <Text style={styles.sliderValue}>{filterRange.max}</Text>
      </View>
      <View style={styles.filterButtons}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {
            setFilterRange({ min: 1, max: 10 });
            setSearchQuery('');
            setIsFiltering(false);
          }}
        >
          <Text style={styles.filterButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, styles.applyButton]}
          onPress={() => setIsFiltering(false)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const groupLogsByDate = () => {
    const grouped: Record<string, MoodLog[]> = {};
    
    filteredLogs.forEach(log => {
      const date = new Date(log.logged_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const renderGroupedLogs = () => {
    const groupedLogs = groupLogsByDate();
    
    return (
      <FlatList
        data={groupedLogs}
        keyExtractor={(item) => item[0]} // Use date as key
        renderItem={({ item }) => {
          const [date, logs] = item;
          return (
            <View style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
              {logs.map(log => (
                <MoodHistoryItem
                  key={log.id}
                  item={log} // Use item instead of moodLog to match component props
                  onDelete={async (id) => {
                    await deleteLog(id);
                  }}
                />
              ))}
            </View>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && !isFiltering}
            onRefresh={onRefresh}
            colors={['#002D62']}
            tintColor="#002D62"
          />
        }
        ListEmptyComponent={renderEmptyState()}
        contentContainerStyle={filteredLogs.length === 0 ? { flex: 1 } : styles.listContentContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood History</Text>
        <TouchableOpacity 
          style={styles.filterIconButton}
          onPress={() => setIsFiltering(!isFiltering)}
        >
          <Feather name="filter" size={20} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {isFiltering ? renderFilterSection() : renderGroupedLogs()}
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
  filterIconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#002D62',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 45, 98, 0.05)',
    fontSize: 16,
    fontWeight: '600',
    color: '#002D62',
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  sliderValue: {
    width: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 10,
    position: 'relative',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#002D62',
    position: 'absolute',
    top: -7,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filterButtonText: {
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#002D62',
    borderColor: '#002D62',
  },
  applyButtonText: {
    color: '#fff',
  },
});

export default MoodHistoryScreen;