"use client"

import { useState, useCallback, useRef } from "react"
import { Platform, ScrollView, View, Animated } from "react-native"
import { Box, Fab, Icon, useBreakpointValue, VStack, HStack } from "native-base"
import { Ionicons } from "@expo/vector-icons"
import { useAppointments } from "../../../contexts/appoint_patient/AppointmentContext"
import { useTheme } from "../../../theme/ThemeProvider"
import AppointmentTabs from "../../../components/Appointments/patient_dashboard/AppointmentTabs"
import BookAppointmentModal from "../../../components/Appointments/patient_dashboard/BookAppointmentModal"
import WaitingListModal from "../../../components/Appointments/patient_dashboard/WaitingListModal"
import FeedbackModal from "../../../components/Appointments/patient_dashboard/FeedbackModal"
import { LinearGradient } from "expo-linear-gradient"
import { Button } from "../../../components/Appointments/patient_dashboard/ui"

const DashboardScreen = () => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [waitingListModalOpen, setWaitingListModalOpen] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Added to trigger refresh

  // Animation for the FAB
  const fabAnim = useRef(new Animated.Value(0)).current

  const { setSelectedAppointment } = useAppointments()
  // Always use light theme
  const { colors } = useTheme()

  // Responsive layout
  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  })

  const contentPadding = useBreakpointValue({
    base: 4,
    md: 6,
    lg: 8,
  })

  const handleOpenBooking = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(fabAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      })
    ]).start()
    
    setBookingModalOpen(true)
  }

  const handleJoinWaitingList = () => {
    setBookingModalOpen(false)
    setWaitingListModalOpen(true)
  }

  const handleOpenFeedback = (appointment: any) => {
    setSelectedAppointment(appointment)
    setFeedbackModalOpen(true)
  }

  // Function to refresh appointment data
  const refreshAppointments = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  // Close handlers that trigger refresh
  const handleCloseBookingModal = () => {
    setBookingModalOpen(false);
    refreshAppointments();
  };

  const handleCloseWaitingListModal = () => {
    setWaitingListModalOpen(false);
    refreshAppointments();
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalOpen(false);
    refreshAppointments();
  };

  return (
    <Box 
      flex={1} 
      bg="#FFFFFF"
      safeAreaTop
      safeAreaBottom
    >
      {/* Main Content with TabsContainer and ScrollView */}
      <Box
        flex={1}
      >
        <LinearGradient colors={['#E4F0F6', '#FFFFFF']} style={{flex: 1, width: "100%"}}>
          <Box 
            width="100%" 
            maxWidth={520} 
            alignSelf="center"
            flex={1}
            pt={4}
          >
            <AppointmentTabs 
              key={refreshKey} // Add key to force remount on refresh
              onOpenFeedback={handleOpenFeedback} 
            />
          </Box>
        </LinearGradient>
      </Box>

      {/* Fixed Bottom Button - Using our enhanced button */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg="#FFFFFF"
        borderTopWidth={1}
        borderTopColor="#E2E8F0"
        px={4}
        py={6}
        safeAreaBottom
        alignItems="center"
        style={{ 
          zIndex: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Animated.View
          style={[
            {
              width: isMobile ? '100%' : 360,
              maxWidth: 400,
              transform: [{ 
                scale: fabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.95]
                })
              }]
            },
            Platform.select({
              web: {
                filter: 'drop-shadow(0 4px 10px rgba(0, 45, 98, 0.16))'
              }
            })
          ]}
        >
          <Button
            onPress={handleOpenBooking}
            variant="solid"
            colorScheme="blue"
            size={isMobile ? "md" : "lg"}
            fullWidth
            borderRadius={999}
            leftIcon={<Ionicons name="add-circle" size={20} color="white" />}
            style={{
              backgroundColor: "#002D62",
              paddingVertical: 16,
            }}
            textStyle={{
              fontWeight: '700',
              fontSize: isMobile ? 16 : 18
            }}
          >
            Book New Appointment
          </Button>
        </Animated.View>
      </Box>

      {/* Modals */}
      <BookAppointmentModal
        isOpen={bookingModalOpen}
        onClose={handleCloseBookingModal}
        onJoinWaitingList={handleJoinWaitingList}
      />

      <WaitingListModal 
        isOpen={waitingListModalOpen} 
        onClose={handleCloseWaitingListModal} 
      />

      <FeedbackModal 
        isOpen={feedbackModalOpen} 
        onClose={handleCloseFeedbackModal} 
      />
    </Box>
  )
}

export default DashboardScreen
