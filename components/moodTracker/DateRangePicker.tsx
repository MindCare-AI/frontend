"use client"

import { useState } from "react"
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native"
import { Button, Card, Text, useTheme, Portal, Modal } from "react-native-paper"
import { format } from "date-fns"
import { Calendar } from "react-native-calendars"
import { MaterialCommunityIcons } from "@expo/vector-icons"

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onDatesChange: (start: Date, end: Date) => void
  style?: object
}

export default function DateRangePicker({ startDate, endDate, onDatesChange, style }: DateRangePickerProps) {
  const theme = useTheme()
  const [isCalendarVisible, setIsCalendarVisible] = useState(false)
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate)
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate)
  const [selectingStart, setSelectingStart] = useState(true)

  // Format dates for display
  const formattedStartDate = startDate ? format(startDate, "MMM d, yyyy") : "Select start date"
  const formattedEndDate = endDate ? format(endDate, "MMM d, yyyy") : "Select end date"

  // Format dates for calendar
  const formatCalendarDate = (date?: Date) => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  const markedDates: any = {}

  if (tempStartDate) {
    const startKey = formatCalendarDate(tempStartDate)
    markedDates[startKey] = {
      startingDay: true,
      color: theme.colors.primary,
      textColor: "#FFFFFF",
    }
  }

  if (tempEndDate) {
    const endKey = formatCalendarDate(tempEndDate)
    markedDates[endKey] = {
      endingDay: true,
      color: theme.colors.primary,
      textColor: "#FFFFFF",
    }
  }

  // Mark dates in between
  if (tempStartDate && tempEndDate) {
    const startTime = tempStartDate.getTime()
    const endTime = tempEndDate.getTime()

    for (let t = startTime + 86400000; t < endTime; t += 86400000) {
      const dateInBetween = new Date(t)
      const dateKey = formatCalendarDate(dateInBetween)
      markedDates[dateKey] = {
        color: `${theme.colors.primary}50`, // 50% opacity
        textColor: "#000000",
      }
    }
  }

  const handleDayPress = (day: { dateString: string }) => {
    const selectedDate = new Date(day.dateString)

    if (selectingStart) {
      setTempStartDate(selectedDate)
      setTempEndDate(undefined)
      setSelectingStart(false)
    } else {
      // Ensure end date is after start date
      if (tempStartDate && selectedDate < tempStartDate) {
        setTempStartDate(selectedDate)
        setTempEndDate(tempStartDate)
      } else {
        setTempEndDate(selectedDate)
        setSelectingStart(true)

        // If both dates are selected, we can close the calendar on mobile
        if (Platform.OS !== "web" && tempStartDate) {
          setTimeout(() => {
            applyDateRange()
          }, 500)
        }
      }
    }
  }

  const applyDateRange = () => {
    if (tempStartDate && tempEndDate) {
      onDatesChange(tempStartDate, tempEndDate)
    }
    setIsCalendarVisible(false)
  }

  const cancelSelection = () => {
    setTempStartDate(startDate)
    setTempEndDate(endDate)
    setIsCalendarVisible(false)
    setSelectingStart(true)
  }

  return (
    <View style={style}>
      <TouchableOpacity onPress={() => setIsCalendarVisible(true)}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="calendar-range" size={20} color={theme.colors.primary} />
            <Text style={styles.dateText}>
              {formattedStartDate} - {formattedEndDate}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {Platform.OS === "web" ? (
        <Portal>
          <Modal visible={isCalendarVisible} onDismiss={cancelSelection} contentContainerStyle={styles.modalContainer}>
            <View style={styles.calendarContainer}>
              <Text variant="titleMedium" style={styles.calendarTitle}>
                {selectingStart ? "Select Start Date" : "Select End Date"}
              </Text>

              <Calendar
                markingType="period"
                markedDates={markedDates}
                onDayPress={handleDayPress}
                theme={{
                  todayTextColor: theme.colors.primary,
                  arrowColor: theme.colors.primary,
                }}
              />

              <View style={styles.buttonContainer}>
                <Button onPress={cancelSelection} mode="outlined">
                  Cancel
                </Button>
                <Button onPress={applyDateRange} mode="contained" disabled={!tempStartDate || !tempEndDate}>
                  Apply
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      ) : (
        <Portal>
          <Modal
            visible={isCalendarVisible}
            onDismiss={cancelSelection}
            contentContainerStyle={styles.mobileModalContainer}
          >
            <View style={styles.mobileCalendarContainer}>
              <Text variant="titleMedium" style={styles.calendarTitle}>
                {selectingStart ? "Select Start Date" : "Select End Date"}
              </Text>

              <Calendar
                markingType="period"
                markedDates={markedDates}
                onDayPress={handleDayPress}
                theme={{
                  todayTextColor: theme.colors.primary,
                  arrowColor: theme.colors.primary,
                }}
              />

              <View style={styles.buttonContainer}>
                <Button onPress={cancelSelection} mode="outlined">
                  Cancel
                </Button>
                <Button onPress={applyDateRange} mode="contained" disabled={!tempStartDate || !tempEndDate}>
                  Apply
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    marginLeft: 8,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 40,
    borderRadius: 8,
  },
  mobileModalContainer: {
    backgroundColor: "white",
    margin: 0,
    marginTop: "auto",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  calendarContainer: {
    padding: 16,
  },
  mobileCalendarContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  calendarTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
})
