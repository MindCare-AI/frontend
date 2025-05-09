"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, useWindowDimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"

import type { AppointmentsStackParamList } from "../../navigation/AppointmentsNavigator"
import Dropdown from "../../components/Appointments/ui/Dropdown"
import { APPOINTMENT_HISTORY } from "../../data/mockData"
import { useTheme } from "../../contexts/ThemeContext"

type NavigationProp = NativeStackNavigationProp<AppointmentsStackParamList>

type SortField = "date" | "therapist" | "type" | "status"

export default function AppointmentHistoryScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { width } = useWindowDimensions()
  const { colors } = useTheme()
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [timeFilter, setTimeFilter] = useState("3months")

  // Responsive layout
  const isSmallScreen = width < 640

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedAppointments = [...APPOINTMENT_HISTORY].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return colors.success
      case "cancelled":
        return colors.danger
      default:
        return colors.muted
    }
  }

  const renderHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TouchableOpacity style={styles.headerCell} onPress={() => handleSort("date")}>
        <Text style={[styles.headerText, { color: colors.primary }]}>Date</Text>
        {sortField === "date" && (
          <Feather name={sortDirection === "asc" ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.headerCell, styles.therapistCell]} onPress={() => handleSort("therapist")}>
        <Text style={[styles.headerText, { color: colors.primary }]}>Therapist</Text>
        {sortField === "therapist" && (
          <Feather name={sortDirection === "asc" ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.headerCell} onPress={() => handleSort("status")}>
        <Text style={[styles.headerText, { color: colors.primary }]}>Status</Text>
        {sortField === "status" && (
          <Feather name={sortDirection === "asc" ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
        )}
      </TouchableOpacity>
    </View>
  )

  const renderItem = ({ item }: { item: (typeof APPOINTMENT_HISTORY)[0] }) => (
    <TouchableOpacity
      style={[styles.tableRow, { borderBottomColor: colors.border }]}
      onPress={() => navigation.navigate("AppointmentDetails", { appointmentId: item.id })}
    >
      <View style={styles.cell}>
        <Text style={[styles.dateText, { color: colors.text }]}>{item.date}</Text>
      </View>

      <View style={[styles.cell, styles.therapistCell]}>
        <Text style={[styles.therapistText, { color: colors.text }]} numberOfLines={1}>
          {item.therapist}
        </Text>
        <Text style={[styles.typeText, { color: colors.secondary }]} numberOfLines={1}>
          {item.type}
        </Text>
      </View>

      <View style={styles.cell}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.filterContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.filterLabel, { color: colors.primary }]}>Filter by:</Text>
        <Dropdown
          placeholder="Last 3 months"
          items={[
            { label: "Last month", value: "1month" },
            { label: "Last 3 months", value: "3months" },
            { label: "Last 6 months", value: "6months" },
            { label: "Last year", value: "1year" },
          ]}
          selectedValue={timeFilter}
          onValueChange={(value) => setTimeFilter(value)}
          style={styles.filterDropdown}
        />
      </View>

      <View
        style={[
          styles.tableContainer,
          { backgroundColor: colors.card },
          Platform.OS === "web" && !isSmallScreen && styles.webTableContainer,
        ]}
      >
        {renderHeader()}

        <FlatList
          data={sortedAppointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="calendar" size={48} color={colors.primaryLight} />
              <Text style={[styles.emptyStateText, { color: colors.primary }]}>No appointment history</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 12,
  },
  filterDropdown: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
    margin: 16,
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
  webTableContainer: {
    maxWidth: 1024,
    marginHorizontal: "auto",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  headerCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  therapistCell: {
    flex: 2,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 14,
  },
  therapistText: {
    fontSize: 14,
    fontWeight: "500",
  },
  typeText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
  },
})
