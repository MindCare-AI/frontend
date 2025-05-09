"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  useWindowDimensions,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { Calendar as RNCalendar, DateData } from "react-native-calendars"
import { Calendar as WebCalendar } from "../../components/Appointments/ui/WebCalendar"

import Button from "../../components/Appointments/ui/Button"
import Dropdown from "../../components/Appointments/ui/Dropdown"
import { THERAPISTS, SESSION_TYPES } from "../../data/mockData"
import { useTheme } from "../../contexts/ThemeContext"

export default function BookAppointmentScreen() {
  const navigation = useNavigation()
  const { width } = useWindowDimensions()
  const { colors } = useTheme()
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Responsive layout
  const isSmallScreen = width < 768

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Mock available time slots based on therapist and type
  const getAvailableTimeSlots = () => {
    if (!selectedTherapist || !selectedType || !selectedDate) {
      return []
    }

    // In a real app, this would come from an API call
    const mockTimeSlots: Record<string, string[]> = {
      "dr-johnson": ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"],
      "dr-chen": ["11:00 AM", "1:30 PM", "4:00 PM"],
      "dr-patel": ["8:30 AM", "12:00 PM", "5:00 PM"],
    }

    return mockTimeSlots[selectedTherapist] || []
  }

  const availableTimeSlots = getAvailableTimeSlots()

  const handleConfirmAppointment = () => {
    if (!selectedTherapist || !selectedType || !selectedDate || !selectedTime) {
      if (Platform.OS === "web") {
        alert("Please select all required fields to book your appointment.")
      } else {
        Alert.alert("Missing Information", "Please select all required fields to book your appointment.")
      }
      return
    }

    // In a real app, this would make an API call to book the appointment
    if (Platform.OS === "web") {
      alert(`Your appointment has been scheduled for ${selectedDate} at ${selectedTime}.`)
      navigation.goBack()
    } else {
      Alert.alert(
        "Appointment Scheduled",
        `Your appointment has been scheduled for ${selectedDate} at ${selectedTime}.`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      )
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.content, Platform.OS === "web" && !isSmallScreen && styles.webContent]}>
          {/* Form Container */}
          <View style={[Platform.OS === "web" && !isSmallScreen && styles.formContainer]}>
            {/* Therapist Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.primary }]}>Select Therapist</Text>
              <Dropdown
                placeholder="Choose a therapist"
                items={THERAPISTS.map((t) => ({ label: t.name, value: t.id }))}
                selectedValue={selectedTherapist}
                onValueChange={(value) => setSelectedTherapist(value)}
              />
            </View>

            {/* Session Type Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.primary }]}>Session Type</Text>
              <Dropdown
                placeholder="Select session type"
                items={SESSION_TYPES.map((t) => ({ label: t.name, value: t.id }))}
                selectedValue={selectedType}
                onValueChange={(value) => setSelectedType(value)}
              />
            </View>
          </View>

          {/* Calendar Container */}
          <View style={[styles.formGroup, Platform.OS === "web" && !isSmallScreen && styles.calendarContainer]}>
            <Text style={[styles.label, { color: colors.primary }]}>Select Date</Text>
            <View style={[styles.calendarWrapper, { backgroundColor: colors.card }]}>
              {Platform.OS === "web" ? (
                <WebCalendar
                  minDate={new Date(today)}
                  selected={selectedDate ? new Date(selectedDate) : undefined}
                  onDateChange={(date) => setSelectedDate(date.toISOString().split("T")[0])}
                />
              ) : (
                <RNCalendar
                  minDate={today}
                  onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                  markedDates={
                    selectedDate ? { [selectedDate]: { selected: true, selectedColor: colors.primary } } : {}
                  }
                  theme={{
                    backgroundColor: colors.card,
                    calendarBackground: colors.card,
                    textSectionTitleColor: colors.primary,
                    selectedDayBackgroundColor: colors.primary,
                    selectedDayTextColor: "#ffffff",
                    todayTextColor: colors.primary,
                    dayTextColor: colors.text,
                    textDisabledColor: colors.muted,
                    dotColor: colors.primary,
                    selectedDotColor: "#ffffff",
                    arrowColor: colors.primary,
                    monthTextColor: colors.primary,
                    indicatorColor: colors.primary,
                    textDayFontWeight: "300",
                    textMonthFontWeight: "600",
                    textDayHeaderFontWeight: "500",
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 14,
                  }}
                />
              )}
            </View>
          </View>

          {/* Time Slots */}
          {selectedTherapist && selectedType && selectedDate && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.primary }]}>Available Time Slots</Text>
              {availableTimeSlots.length > 0 ? (
                <View style={styles.timeSlotContainer}>
                  {availableTimeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        selectedTime === time && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          { color: colors.primary },
                          selectedTime === time && { color: "white" },
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={[styles.noTimeSlotsContainer, { backgroundColor: colors.card }]}>
                  <Feather name="clock" size={24} color={colors.primaryLight} />
                  <Text style={[styles.noTimeSlotsText, { color: colors.primary }]}>
                    No available time slots for the selected date.
                  </Text>
                  <Text style={[styles.noTimeSlotsSubtext, { color: colors.secondary }]}>Please try another date.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="Confirm Appointment"
          onPress={handleConfirmAppointment}
          primary
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  webContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  formContainer: {
    width: "40%",
  },
  calendarContainer: {
    width: "55%",
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  calendarWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  timeSlotContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  timeSlot: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      },
    }),
  },
  timeSlotText: {
    fontSize: 14,
    textAlign: "center",
  },
  noTimeSlotsContainer: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  noTimeSlotsText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
    textAlign: "center",
  },
  noTimeSlotsSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 -1px 4px rgba(0, 0, 0, 0.05)",
      },
    }),
  },
})
