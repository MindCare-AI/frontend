"use client"

import { useState } from "react"
import { Platform, ScrollView, View } from "react-native"
import { Box, Fab, Icon, useBreakpointValue, VStack, HStack, useSafeArea } from "native-base"
import { Ionicons } from "@expo/vector-icons"
import { useAppointments } from "../../contexts/AppointmentContext"
import { useTheme } from "../../theme/ThemeProvider"
import AppointmentTabs from "../../components/Appointments/patient_dashboard/AppointmentTabs"
import BookAppointmentModal from "../../components/Appointments/patient_dashboard/BookAppointmentModal"
import WaitingListModal from "../../components/Appointments/patient_dashboard/WaitingListModal"
import FeedbackModal from "../../components/Appointments/patient_dashboard/FeedbackModal"
import Header from "../../components/Appointments/patient_dashboard/Header"
import { ThemeToggle } from "../../components/Appointments/patient_dashboard/ui"

const DashboardScreen = () => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [waitingListModalOpen, setWaitingListModalOpen] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)

  const { setSelectedAppointment } = useAppointments()
  const { isDarkMode, colors } = useTheme()
  const safeArea = useSafeArea({ edges: ['bottom'] })

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

  return (
    <Box 
      flex={1} 
      bg={isDarkMode ? colors.background.dark : colors.background.light}
      safeArea
    >
      {/* Fixed Header */}
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        zIndex={10}
        bg={isDarkMode ? colors.background.dark : colors.background.light}
      >
        <Header />
        <HStack 
          justifyContent="flex-end" 
          px={contentPadding} 
          pb={2}
        >
          <ThemeToggle />
        </HStack>
      </Box>

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingTop: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Box width="100%" maxWidth={520} alignSelf="center">
          <AppointmentTabs onOpenFeedback={handleOpenFeedback} />
        </Box>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg={isDarkMode ? colors.background.dark : colors.background.light}
        borderTopWidth={1}
        borderTopColor={isDarkMode ? "#2D3748" : "#E2E8F0"}
        px={0}
        py={6}
        safeAreaBottom
        alignItems="center"
        style={{ zIndex: 20 }}
      >
        <Box
          width={isMobile ? '90%' : 360}
          maxWidth={400}
          alignItems="center"
          style={{
            shadowColor: '#3182CE',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Fab
            renderInPortal={false}
            shadow={0}
            size={useBreakpointValue({ base: "md", md: "lg" })}
            icon={<Icon color="white" as={Ionicons} name="add" size="sm" />}
            label={Platform.OS !== "web" ? undefined : "Book New Appointment"}
            bg="primary.500"
            onPress={handleOpenBooking}
            width={"100%"}
            minWidth={isMobile ? undefined : 200}
            borderRadius={999}
            _text={{ fontWeight: '700', fontSize: 18 }}
            py={4}
          />
        </Box>
      </Box>

      {/* Modals */}
      <BookAppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onJoinWaitingList={handleJoinWaitingList}
      />

      <WaitingListModal 
        isOpen={waitingListModalOpen} 
        onClose={() => setWaitingListModalOpen(false)} 
      />

      <FeedbackModal 
        isOpen={feedbackModalOpen} 
        onClose={() => setFeedbackModalOpen(false)} 
      />
    </Box>
  )
}

export default DashboardScreen
