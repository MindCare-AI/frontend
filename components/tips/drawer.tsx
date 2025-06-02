"use client"

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';

interface DrawerProps {
  children?: React.ReactNode;
  tipType?: 'mood' | 'journaling';
  title?: string;
}

interface Tip {
  title: string;
  description: string;
  expected_benefit: string;
  personalization_reason?: string;
  optimal_timing?: string;
  category?: string;
  difficulty?: string;
  estimated_time?: string;
  implementation_guide?: string;
  success_indicators?: string;
}

interface ApiResponse {
  tips: Tip[];
  message?: string;
  suggestion?: string;
  journal_analysis?: any;
  analysis_period?: string;
  generated_at?: string;
  tip_count?: number;
  data_integration?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function Drawer({ children, tipType = 'mood', title }: DrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [slideAnim] = useState(new Animated.Value(-300))
  const [tipsData, setTipsData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const { accessToken } = useAuth();

  // Fetch tips when drawer opens
  useEffect(() => {
    if (isDrawerOpen && !tipsData && accessToken) {
      fetchTips();
    }
  }, [isDrawerOpen, accessToken, tipType]);

  const fetchTips = async () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setLoading(true);
    try {
      const endpoint = tipType === 'journaling' ? '/ai/tips/journaling/' : '/ai/tips/mood/';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTipsData(data);
    } catch (error) {
      console.error(`Failed to fetch ${tipType} tips:`, error);
      setTipsData({ 
        tips: [], 
        message: 'Failed to load tips',
        suggestion: 'Please check your connection and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      // Close drawer
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsDrawerOpen(false))
    } else {
      // Open drawer
      setIsDrawerOpen(true)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsDrawerOpen(false))
  }

  const DrawerContent = () => (
    <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>{title || `${tipType === 'journaling' ? 'Journaling' : 'Mood'} Tips`}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={closeDrawer} activeOpacity={0.7}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading personalized tips...</Text>
        </View>
      )}

      {/* No Data Message */}
      {tipsData && tipsData.tips.length === 0 && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{tipsData.message}</Text>
          {tipsData.suggestion && (
            <Text style={styles.suggestionText}>{tipsData.suggestion}</Text>
          )}
        </View>
      )}

      {/* Tips Content */}
      {tipsData && tipsData.tips.map((tip, index) => (
        <View key={index} style={[styles.dataSection, tipType === 'journaling' ? styles.journalingTipSection : styles.tipSection]}>
          <Text style={styles.sectionTitle}>{tip.title}</Text>
          
          {/* Description Section */}
          <View style={styles.contentBlock}>
            <Text style={styles.contentLabel}>Description</Text>
            <Text style={styles.contentText}>{tip.description}</Text>
          </View>
          
          {/* Expected Benefit Section */}
          <View style={styles.contentBlock}>
            <Text style={styles.contentLabel}>Expected Benefit</Text>
            <Text style={styles.benefitText}>{tip.expected_benefit}</Text>
          </View>

          {/* Journaling-specific fields */}
          {tipType === 'journaling' && (
            <>
              {tip.category && (
                <View style={styles.contentBlock}>
                  <Text style={styles.contentLabel}>Category</Text>
                  <Text style={styles.categoryText}>{tip.category}</Text>
                </View>
              )}
              
              {tip.difficulty && tip.estimated_time && (
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.contentLabel}>Difficulty</Text>
                    <Text style={styles.difficultyText}>{tip.difficulty}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.contentLabel}>Time</Text>
                    <Text style={styles.timeText}>{tip.estimated_time}</Text>
                  </View>
                </View>
              )}

              {tip.implementation_guide && (
                <View style={styles.contentBlock}>
                  <Text style={styles.contentLabel}>How to Implement</Text>
                  <Text style={styles.contentText}>{tip.implementation_guide}</Text>
                </View>
              )}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      {/* Menu Button - Fixed position */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer} activeOpacity={0.7}>
        <View style={styles.menuIcon}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {children}
      </View>

      {/* Drawer Modal */}
      <Modal visible={isDrawerOpen} transparent={true} animationType="none" onRequestClose={closeDrawer}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.overlay} onPress={closeDrawer} activeOpacity={1} />
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <DrawerContent />
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  menuButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20, // Changed from left: 20 to right: 20
    zIndex: 1000,
    width: 44,
    height: 44,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  menuIcon: {
    width: 20,
    height: 16,
    justifyContent: "space-between",
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: "#374151",
  },
  modalContainer: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 40,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: Math.min(320, screenWidth * 0.8),
    height: screenHeight,
    backgroundColor: "#ffffff",
    zIndex: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#6b7280",
  },
  dataSection: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipSection: {
    backgroundColor: "#fef3c7",
  },
  journalingTipSection: {
    backgroundColor: "#e0f2fe",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  contentBlock: {
    marginBottom: 16,
  },
  contentLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
    fontWeight: "400",
  },
  benefitText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#059669",
    fontWeight: "500",
    fontStyle: "italic",
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  messageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#0369a1",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  difficultyText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#dc2626",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  timeText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#7c3aed",
    fontWeight: "500",
  },
})
