import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { FAB, Portal, Modal, IconButton, Text, Button, useTheme } from 'react-native-paper';
import { useMoodLogs } from '../../hooks/moodTracker/useMoodLogs';
import { useMoodAnalytics } from '../../hooks/moodTracker/useMoodAnalytics';
import { MoodProvider } from '../../contexts/moodContext';
import MoodEntryForm from '../../components/moodTracker/MoodEntryForm';
import MoodFeedList from '../../components/moodTracker/MoodFeedList';
import AnalyticsSummary from '../../components/moodTracker/AnalyticsSummary';
import { MoodLog, MoodFormData } from '../../types/Mood';

// Check if platform is web to avoid using native driver
const isWeb = Platform.OS === 'web';

export default function MoodScreen() {
  return (
    <MoodProvider>
      <MoodScreenContent />
    </MoodProvider>
  );
}

function MoodScreenContent() {
  const theme = useTheme();
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodLog | null>(null);
  const [showCards, setShowCards] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  
  // Custom blue and white theme colors
  const colors = {
    primary: '#0d6efd',
    lightBlue: '#cfe2ff',
    white: '#ffffff',
    darkBlue: '#084298',
    background: '#f8f9fa',
  };
  
  const { 
    moodLogs, 
    isLoading, 
    fetchMoodLogs,
    createMoodLog,
    updateMoodLog,
    deleteMoodLog,
  } = useMoodLogs();
  
  const { 
    analytics,
    refreshAnalytics
  } = useMoodAnalytics();

  useEffect(() => {
    fetchMoodLogs();
    refreshAnalytics();
    
    // Initial animations - don't use native driver on web
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: !isWeb,
      }),
    ]).start();
  }, []);

  const handleMoodSubmit = async (data: MoodFormData) => {
    if (selectedMood) {
      await updateMoodLog(selectedMood.id, data);
    } else {
      await createMoodLog(data);
    }
    setMoodModalVisible(false);
    setSelectedMood(null);
    
    // Trigger animation for fresh data - don't use native driver on web
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: !isWeb,
      }),
    ]).start();
  };
  
  const handleEditMood = (log: MoodLog) => {
    // For direct editing, just show the modal
    setSelectedMood(log);
    setMoodModalVisible(true);
    
    // If you want to use navigation, use the renamed route
    // navigation.navigate('MoodDetail', { moodLog: log });
  };

  const toggleCardView = () => {
    setShowCards(!showCards);
    
    // Animate transition - don't use native driver on web
    Animated.timing(slideAnim, {
      toValue: showCards ? 50 : 0,
      duration: 500,
      useNativeDriver: !isWeb,
    }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.analyticsContainer, 
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.white,
          }
        ]}
      >
        <AnalyticsSummary style={styles.analytics} />
      </Animated.View>
      
      <View style={styles.toggleContainer}>
        <Button 
          mode={showCards ? "contained" : "outlined"} 
          onPress={toggleCardView}
          style={styles.toggleButton}
          labelStyle={{ color: showCards ? colors.white : colors.primary }}
          buttonColor={colors.primary}
        >
          {showCards ? "Hide Entries" : "Show Entries"}
        </Button>
        <Button 
          mode="contained" 
          onPress={() => setMoodModalVisible(true)}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          icon="plus"
        >
          Track Mood
        </Button>
      </View>
      
      {showCards && (
        <Animated.View 
          style={[
            styles.cardsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text 
            variant="titleMedium" 
            style={[styles.sectionTitle, { color: colors.darkBlue }]}
          >
            Your Mood History
          </Text>
          <MoodFeedList
            moodLogs={moodLogs}
            isLoading={isLoading}
            onRefresh={fetchMoodLogs}
            onEdit={handleEditMood}
            onDelete={deleteMoodLog}
          />
        </Animated.View>
      )}
      
      {/* Modal for mood entry */}
      <Portal>
        <Modal
          visible={moodModalVisible}
          onDismiss={() => {
            setMoodModalVisible(false);
            setSelectedMood(null);
          }}
          contentContainerStyle={styles.modalContent}
        >
          <IconButton
            icon="close"
            size={24}
            onPress={() => {
              setMoodModalVisible(false);
              setSelectedMood(null);
            }}
            style={styles.closeButton}
          />
          <MoodEntryForm
            onSubmit={handleMoodSubmit}
            initialValues={selectedMood || undefined}
            onCancel={() => {
              setMoodModalVisible(false);
              setSelectedMood(null);
            }}
          />
        </Modal>
      </Portal>
      
      {/* Floating action button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setMoodModalVisible(true)}
        visible={!moodModalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  analyticsContainer: {
    borderRadius: 16,
    margin: 16,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analytics: {
    borderRadius: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  toggleButton: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    flex: 1,
    marginLeft: 8,
  },
  cardsContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 8,
    maxHeight: '80%',
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
    backgroundColor: '#0d6efd',
  },
});
