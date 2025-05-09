"use client"

import { useState } from "react"
import { Platform } from "react-native"
import { Box, Fab, Icon, useBreakpointValue } from "native-base"
import { Ionicons } from "@expo/vector-icons"
import { useAppointments } from "../../contexts/AppointmentContext"
import { useTheme } from "../../theme/ThemeProvider"
import AppointmentTabs from "../../components/Appointments/patient_dashboard/AppointmentTabs"
import BookAppointmentModal from "../../components/Appointments/patient_dashboard/BookAppointmentModal"
import WaitingListModal from "../../components/Appointments/patient_dashboard/WaitingListModal"
import FeedbackModal from "../../components/Appointments/patient_dashboard/FeedbackModal"
import Header from "../../components/Appointments/patient_dashboard/Header"
import { ThemeToggle } from "../../components/Appointments/patient_dashboard//ui"

const DashboardScreen = () => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [waitingListModalOpen, setWaitingListModalOpen] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)

  const { setSelectedAppointment } = useAppointments()
  const { isDarkMode, colors } = useTheme()

  // Responsive layout
  const isMobile = useBreakpointValue({
    base: true,
    md: false,
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
    <Box flex={1} bg={isDarkMode ? colors.background.dark : colors.background.light} safeArea>
      <Header />

      <Box flex={1} px={4} py={6}>
        <Box position="absolute" top={4} right={4} zIndex={10}>
          <ThemeToggle />
        </Box>
        <AppointmentTabs onOpenFeedback={handleOpenFeedback} />
      </Box>

      {/* Floating Action Button */}
      <Fab
        renderInPortal={false}
        shadow={2}
        size="lg"
        icon={<Icon color="white" as={Ionicons} name="add" size="sm" />}
        label={Platform.OS !== "web" ? undefined : "Book New Appointment"}
        bg="primary.500"
        onPress={handleOpenBooking}
        position="absolute"
        bottom={10}
        right={10}
      />

      {/* Modals */}
      <BookAppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onJoinWaitingList={handleJoinWaitingList}
      />

      <WaitingListModal isOpen={waitingListModalOpen} onClose={() => setWaitingListModalOpen(false)} />

      <FeedbackModal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />
    </Box>
  )
}

export default DashboardScreen
