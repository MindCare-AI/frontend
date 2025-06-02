import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { FAB, Portal, Modal, IconButton, Text, Button, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useMoodLogs } from '../../hooks/moodTracker/useMoodLogs';
import { useMoodAnalytics } from '../../hooks/moodTracker/useMoodAnalytics';
import { MoodProvider } from '../../contexts/moodContext';
import MoodEntryForm from '../../components/moodTracker/MoodEntryForm';
import MoodFeedList from '../../components/moodTracker/MoodFeedList';
import AnalyticsSummary from '../../components/moodTracker/AnalyticsSummary';
import { MoodLog, MoodFormData } from '../../types/Mood';
import { useFocusEffect } from '@react-navigation/native';
import Drawer from '../../components/tips/drawer';

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
  
  // Custom colors to match HomeSettingsScreen
  const colors = {
    primary: '#002D62', // Deep blue like in HomeSettingsScreen
    lightBlue: '#E4F0F6', // Light blue background
    lightPurple: '#F0EAFF', // Light purple for buttons
    white: '#FFFFFF',
    textDark: '#333',
    textMedium: '#444',
    borderColor: '#F0F0F0',
    background: '#FFFFFF',
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

  // Use useFocusEffect to fetch data when screen becomes focused
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching data...");
      // Force immediate data loading
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
      
      return () => {}; // Cleanup if needed
    }, [])
  );

  // Manually trigger refresh when needed
  const manualRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    fetchMoodLogs();
    refreshAnalytics();
  }, [fetchMoodLogs, refreshAnalytics]);

  const handleMoodSubmit = async (data: MoodFormData) => {
    if (selectedMood) {
      await updateMoodLog(selectedMood.id, data);
    } else {
      await createMoodLog(data);
    }
    setMoodModalVisible(false);
    setSelectedMood(null);
    
    // Refresh data after submission
    fetchMoodLogs();
    refreshAnalytics();
    
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
    setSelectedMood(log);
    setMoodModalVisible(true);
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
    <Drawer>
      <View style={styles.container}>
        <LinearGradient colors={[colors.lightBlue, colors.white]} style={styles.gradientContainer}>
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
              labelStyle={{ color: colors.white }} // <-- ensure white text
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
              <View style={styles.historyHeader}>
                <Text 
                  variant="titleMedium" 
                  style={[styles.sectionTitle, { color: colors.textDark }]}
                >
                  Your Mood History
                </Text>
                <Button
                  icon="refresh"
                  mode="text"
                  onPress={manualRefresh}
                  labelStyle={{ color: colors.primary }}
                >
                  Refresh
                </Button>
              </View>
              <MoodFeedList
                moodLogs={moodLogs}
                isLoading={isLoading}
                onRefresh={fetchMoodLogs}
                onEdit={handleEditMood}
                onDelete={deleteMoodLog}
                colors={colors}
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
                iconColor={colors.primary}
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
                colors={colors}
              />
            </Modal>
          </Portal>

          
        </LinearGradient>
      </View>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    padding: 20,
  },
  analyticsContainer: {
    borderRadius: 16,
    marginVertical: 16,
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
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
  },
  addButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
  },
  cardsContainer: {
    flex: 1,
    paddingBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
    fontSize: 18,
  },
  modalContent: {
    margin: 5, // Further reduced margin
    borderRadius: 16,
    padding: 20, // Increased padding
    maxHeight: '98%', // Use almost entire screen height
    minHeight: 600, // Increased minimum height for emoji pickers
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
    borderRadius: 28,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});
