import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useJournal } from '../../contexts/JournalContext';
import JournalEntryCard from '../../components/JournalScreen/JournalEntryCard';
import MoodChart from '../../components/JournalScreen/MoodChart';
import { JournalEntry, JournalFilterParams } from '../../types/journal';
import { JournalStackParamList } from '../../navigation/JournalNavigator';
import { formatDate, getCurrentDate } from '../../utils/dateUtils';

type NavigationProp = StackNavigationProp<JournalStackParamList>;

const JournalScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { entries, loading, error, fetchEntries, filterParams, setFilters } = useJournal();

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showSharedOnly, setShowSharedOnly] = useState<boolean>(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Update entries when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries])
  );

  // Handle filter changes
  const applyFilters = useCallback(() => {
    const newFilters: JournalFilterParams = {
      search: searchQuery || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      shared: showSharedOnly || undefined,
    };
    setFilters(newFilters);
    fetchEntries(newFilters);
  }, [searchQuery, startDate, endDate, showSharedOnly, setFilters, fetchEntries]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setShowSharedOnly(false);
    setFilters({});
    fetchEntries({});
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

  // Navigate to journal entry detail
  const handleEntryPress = (entry: JournalEntry) => {
    navigation.navigate('JournalDetail', { journalId: entry.id });
  };

  // Navigate to create new entry
  const handleCreateEntry = () => {
    navigation.navigate('JournalCreate');
  };

  // Navigate to statistics screen
  const handleViewStatistics = () => {
    navigation.navigate('JournalStatistics');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search journal entries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={applyFilters}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons 
            name={showFilters ? "filter-list-off" : "filter-list"} 
            size={24} 
            color="#1976d2" 
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filter Entries</Text>
          
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateButtonLabel}>From:</Text>
              <Text style={styles.dateButtonText}>
                {startDate ? formatDate(startDate) : 'Select Date'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.dateButtonLabel}>To:</Text>
              <Text style={styles.dateButtonText}>
                {endDate ? formatDate(endDate) : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate ? new Date(startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowStartDatePicker(false);
                if (date) {
                  setStartDate(date.toISOString().split('T')[0]);
                }
              }}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate ? new Date(endDate) : new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowEndDatePicker(false);
                if (date) {
                  setEndDate(date.toISOString().split('T')[0]);
                }
              }}
            />
          )}

          <View style={styles.filterActionRow}>
            <View style={styles.sharedFilterContainer}>
              <Text>Shared with Therapist</Text>
              <TouchableOpacity 
                style={[
                  styles.checkboxContainer,
                  showSharedOnly && styles.checkboxChecked
                ]}
                onPress={() => setShowSharedOnly(!showSharedOnly)}
              >
                {showSharedOnly && (
                  <MaterialIcons name="check" size={16} color="white" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.filterButtons}>
              <TouchableOpacity 
                style={styles.clearFilterButton} 
                onPress={clearFilters}
              >
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyFilterButton} 
                onPress={applyFilters}
              >
                <Text style={styles.applyFilterText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStatsCard}>
          <Text style={styles.quickStatsNumber}>{entries.length}</Text>
          <Text style={styles.quickStatsLabel}>Total Entries</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.statsButton} 
          onPress={handleViewStatistics}
        >
          <Text style={styles.statsButtonText}>View Statistics</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading journal entries...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchEntries()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="book" size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No Journal Entries</Text>
              <Text style={styles.emptyText}>
                Start writing in your journal to track your thoughts and feelings.
              </Text>
              <TouchableOpacity 
                style={styles.createButton} 
                onPress={handleCreateEntry}
              >
                <Text style={styles.createButtonText}>Create First Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <JournalEntryCard entry={item} onPress={handleEntryPress} />
              )}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListHeaderComponent={
                <MoodChart 
                  entries={entries.slice(0, 7)} 
                  period="week"
                  title="Recent Mood Trends" 
                />
              }
            />
          )}
        </>
      )}

      {entries.length > 0 && (
        <TouchableOpacity 
          style={styles.fabButton} 
          onPress={handleCreateEntry}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomColor: '#eeeeee',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomColor: '#eeeeee',
    borderBottomWidth: 1,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    flex: 0.48,
  },
  dateButtonLabel: {
    fontWeight: '600',
    marginRight: 6,
  },
  dateButtonText: {
    flex: 1,
    color: '#666',
  },
  sharedFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1976d2',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1976d2',
  },
  filterActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtons: {
    flexDirection: 'row',
  },
  clearFilterButton: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFilterText: {
    color: '#666',
  },
  applyFilterButton: {
    backgroundColor: '#1976d2',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  applyFilterText: {
    color: 'white',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  quickStatsCard: {
    alignItems: 'center',
  },
  quickStatsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  quickStatsLabel: {
    fontSize: 12,
    color: '#666',
  },
  statsButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statsButtonText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default JournalScreen;