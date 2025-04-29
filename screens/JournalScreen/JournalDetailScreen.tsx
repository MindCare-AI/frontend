import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useJournal } from '../../contexts/JournalContext';
import { JournalStackParamList } from '../../navigation/JournalNavigator';
import ShareButton from '../../components/JournalScreen/ShareButton';
import { formatDateTime } from '../../utils/dateUtils';
import { JournalEntry, Mood, Weather } from '../../types/journal';

type DetailScreenRouteProp = RouteProp<JournalStackParamList, 'JournalDetail'>;
type NavigationProp = StackNavigationProp<JournalStackParamList>;

// Mood emojis and descriptions
const moodEmojis: Record<Mood, string> = {
  very_negative: '😭',
  negative: '😔',
  neutral: '😐', 
  positive: '🙂',
  very_positive: '😄',
};

const moodDescriptions: Record<Mood, string> = {
  very_negative: 'Very Negative',
  negative: 'Negative',
  neutral: 'Neutral',
  positive: 'Positive',
  very_positive: 'Very Positive',
};

// Weather icons and labels
const weatherIcons: Record<Weather, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
};

const weatherLabels: Record<Weather, string> = {
  sunny: 'Sunny',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
  stormy: 'Stormy',
  snowy: 'Snowy',
};

const JournalDetailScreen: React.FC = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { journalId } = route.params;
  const { fetchEntry, removeEntry, entries, currentEntry } = useJournal();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, check if the entry is already in our context
        const existingEntry = entries.find(e => e.id === journalId);
        
        if (existingEntry) {
          setEntry(existingEntry);
        } else {
          // Fetch from API if not in context
          const fetchedEntry = await fetchEntry(journalId);
          setEntry(fetchedEntry);
        }
      } catch (err) {
        console.error('Error loading journal entry:', err);
        setError('Failed to load journal entry. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [journalId, fetchEntry, entries, currentEntry]);

  // Handle editing the journal entry
  const handleEdit = () => {
    if (entry) {
      navigation.navigate('JournalEdit', { entry });
    }
  };

  // Handle deleting the journal entry
  const handleDelete = () => {
    Alert.alert(
      'Delete Journal Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              await removeEntry(journalId);
              navigation.goBack();
            } catch (err) {
              console.error('Error deleting entry:', err);
              Alert.alert('Error', 'Failed to delete the journal entry.');
              setLoading(false);
            }
          } 
        },
      ]
    );
  };

  // Handle successful share
  const handleShareSuccess = () => {
    if (entry) {
      setEntry({
        ...entry,
        shared_with_therapist: true,
      });
    }
  };

  // Handle sharing the entry
  const handleShareEntry = () => {
    // Using the ShareButton component will handle this
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading journal entry...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => fetchEntry(journalId)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#f44336" />
        <Text style={styles.errorText}>Journal entry not found.</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.date}>{formatDateTime(entry.created_at)}</Text>
        </View>

        <View style={styles.moodWeatherContainer}>
          <View style={styles.moodContainer}>
            <Text style={styles.moodEmoji}>{moodEmojis[entry.mood]}</Text>
            <Text style={styles.moodDescription}>{moodDescriptions[entry.mood]}</Text>
          </View>

          <View style={styles.weatherContainer}>
            <Text style={styles.weatherIcon}>{weatherIcons[entry.weather]}</Text>
            <Text style={styles.weatherLabel}>{weatherLabels[entry.weather]}</Text>
          </View>
        </View>

        {entry.activities && (
          <View style={styles.activitiesContainer}>
            <Text style={styles.sectionTitle}>Activities:</Text>
            <Text style={styles.activities}>{entry.activities.replace(/,/g, ', ')}</Text>
          </View>
        )}

        <View style={styles.contentContainer}>
          <Text style={styles.content}>{entry.content}</Text>
        </View>

        <View style={styles.metadataContainer}>
          <Text style={styles.metadata}>
            Word count: {entry.word_count}
          </Text>
          <Text style={styles.metadata}>
            Privacy: {entry.is_private ? 'Private' : 'Public'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <MaterialIcons name="edit" size={24} color="#1976d2" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <MaterialIcons name="delete" size={24} color="#f44336" />
            <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>

        <ShareButton 
          entry={entry} 
          onShareSuccess={handleShareSuccess}
          style={styles.shareButton} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  moodWeatherContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  moodContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  moodDescription: {
    fontSize: 16,
  },
  weatherContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  weatherIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  weatherLabel: {
    fontSize: 16,
  },
  activitiesContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  activities: {
    fontSize: 16,
  },
  contentContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  metadataContainer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metadata: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1976d2',
  },
  deleteText: {
    color: '#f44336',
  },
  shareButton: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default JournalDetailScreen;