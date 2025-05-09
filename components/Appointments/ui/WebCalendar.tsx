"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../../contexts/ThemeContext"

interface WebCalendarProps {
  minDate?: Date
  selected?: Date
  onDateChange: (date: Date) => void
}

export function Calendar({ minDate, selected, onDateChange }: WebCalendarProps) {
  const { colors } = useTheme()
  const [currentMonth, setCurrentMonth] = useState(selected || new Date())

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendarHeader = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const prevMonth = () => {
      setCurrentMonth(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
      setCurrentMonth(new Date(year, month + 1, 1))
    }

    return (
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <Feather name="chevron-left" size={20} color={colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.monthYearText, { color: colors.primary }]}>
          {monthNames[month]} {year}
        </Text>

        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <Feather name="chevron-right" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    )
  }

  const renderDaysOfWeek = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <View style={styles.daysOfWeek}>
        {daysOfWeek.map((day, index) => (
          <Text key={index} style={[styles.dayOfWeekText, { color: colors.secondary }]}>
            {day}
          </Text>
        ))}
      </View>
    )
  }

  const renderDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isSelected =
        selected &&
        date.getDate() === selected.getDate() &&
        date.getMonth() === selected.getMonth() &&
        date.getFullYear() === selected.getFullYear()

      const isToday = new Date().toDateString() === date.toDateString()

      const isDisabled = minDate && date < minDate

      days.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.dayCell,
            isSelected && [styles.selectedDay, { backgroundColor: colors.primary }],
            isToday && !isSelected && [styles.todayCell, { borderColor: colors.primary }],
          ]}
          onPress={() => !isDisabled && onDateChange(date)}
          disabled={isDisabled}
        >
          <Text
            style={[
              styles.dayText,
              { color: colors.text },
              isSelected && styles.selectedDayText,
              isDisabled && { color: colors.muted },
              isToday && !isSelected && { color: colors.primary },
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>,
      )
    }

    return <View style={styles.daysGrid}>{days}</View>
  }

  return (
    <View style={styles.calendar}>
      {renderCalendarHeader()}
      {renderDaysOfWeek()}
      {renderDays()}
    </View>
  )
}

const styles = StyleSheet.create({
  calendar: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: "600",
  },
  daysOfWeek: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 14,
  },
  selectedDay: {
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "500",
  },
  todayCell: {
    borderWidth: 1,
    borderRadius: 20,
  },
})
