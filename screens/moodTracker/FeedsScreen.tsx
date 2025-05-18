"use client"

import { useState, useCallback, useRef } from "react"
import { View, StyleSheet, Platform, Alert, RefreshControl, ScrollView } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useTheme, Text, Button, ActivityIndicator, FAB, Portal, Modal } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { MainTabParamList, RootStackParamList } from "../../navigation/mood/MoodNavigator"
import type { CompositeScreenProps } from "@react-navigation/native"
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { FilterOptions, SortBy, SortOrder } from "../../types/mood/mood"
import { useMoodData } from "../../hooks/Mood/useMoodData"
import MoodFeedList from "../../components/moodTracker/MoodFeedList"
import DateRangePicker from "../../components/moodTracker/DateRangePicker"
import AnalyticsSummary from "../../components/moodTracker/AnalyticsSummary"
import FilterSheet from "../../components/moodTracker/FilterSheet"
import BulkEntryForm from "../../components/moodTracker/BulkEntryForm"

type FeedsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Feeds">,
  NativeStackScreenProps<RootStackParamList>
>

export default function FeedsScreen({ navigation }: FeedsScreenProps) {
  const theme = useTheme()
  const scrollViewRef = useRef<ScrollView>(null)

  // Set default date range to current month
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: {
      from: firstDayOfMonth,
      to: today,
    },
    sortBy: "logged_at",
    sortOrder: "desc",
    moodRange: [1, 10],
    filterActivity: "all",
    searchText: "",
  })

  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false)
  const [isBulkEntryVisible, setIsBulkEntryVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const { filteredLogs, isLoading, error } = useMoodData(filterOptions)

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      // This would typically fetch fresh data from an API
      // For now, we're just using the mock data
    }, []),
  )

  const handleDateRangeChange = (from: Date, to: Date) => {
    setFilterOptions((prev) => ({
      ...prev,
      dateRange: { from, to },
    }))
    // Scroll to top when filter changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true })
    }
  }

  const handleFilterChange = (
    sortBy: SortBy,
    sortOrder: SortOrder,
    moodRange: [number, number],
    activity: string,
    searchText: string,
  ) => {
    setFilterOptions({
      ...filterOptions,
      sortBy,
      sortOrder,
      moodRange,
      filterActivity: activity,
      searchText,
    })
    setIsFilterSheetVisible(false)
    // Scroll to top when filter changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true })
    }
  }

  const handleExportCSV = () => {
    // In a real app, this would call an API endpoint to generate and download the CSV
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        const newProgress = prev + 0.1
        if (newProgress >= 1) {
          clearInterval(interval)
          setTimeout(() => {
            setIsExporting(false)
            Alert.alert("Export Complete", "Your mood logs have been exported successfully.", [{ text: "OK" }])
          }, 500)
          return 1
        }
        return newProgress
      })
    }, 300)
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    // In a real app, this would refresh data from the API
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Mood Feed
        </Text>
        <View style={styles.headerButtons}>
          <Button
            mode="contained-tonal"
            icon="filter-variant"
            onPress={() => setIsFilterSheetVisible(true)}
            style={styles.filterButton}
          >
            Filter
          </Button>
          <Button
            mode="contained-tonal"
            icon="playlist-plus"
            onPress={() => setIsBulkEntryVisible(true)}
            style={styles.bulkButton}
          >
            Bulk
          </Button>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <AnalyticsSummary style={styles.analyticsCard} />

        <View style={styles.feedHeader}>
          <Text variant="titleMedium">Your Mood Logs</Text>
          <Button
            mode="outlined"
            icon="download"
            onPress={handleExportCSV}
            compact
            loading={isExporting}
            disabled={isExporting}
          >
            Export
          </Button>
        </View>

        <Text style={styles.dateRangeLabel}>Filter by date range:</Text>
        <DateRangePicker
          startDate={filterOptions.dateRange?.from}
          endDate={filterOptions.dateRange?.to}
          onDatesChange={handleDateRangeChange}
          style={styles.dateRangePicker}
        />

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <MoodFeedList
            data={filteredLogs}
            onViewDetails={(entry) => navigation.navigate("Details", { entry })}
            onEditEntry={(entry) => navigation.navigate("EditEntry", { entry })}
            isLoading={isLoading}
            error={error}
          />
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("NewEntry")}
        color="#fff"
      />

      <FilterSheet
        visible={isFilterSheetVisible}
        onDismiss={() => setIsFilterSheetVisible(false)}
        initialValues={{
          sortBy: filterOptions.sortBy,
          sortOrder: filterOptions.sortOrder,
          moodRange: filterOptions.moodRange,
          activity: filterOptions.filterActivity,
          searchText: filterOptions.searchText,
        }}
        onApplyFilters={handleFilterChange}
      />

      <BulkEntryForm
        visible={isBulkEntryVisible}
        onDismiss={() => setIsBulkEntryVisible(false)}
        onSave={() => {
          setIsBulkEntryVisible(false)
          Alert.alert("Success", "Bulk entries added successfully")
        }}
      />

      {/* Export Progress Modal */}
      <Portal>
        <Modal visible={isExporting} dismissable={false} contentContainerStyle={styles.exportModal}>
          <Text variant="titleMedium" style={styles.exportTitle}>
            Exporting Mood Logs
          </Text>
          <Text style={styles.exportSubtitle}>Please wait while your data is being prepared...</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${exportProgress * 100}%` }]} />
          </View>
          <Text style={styles.exportProgress}>{Math.round(exportProgress * 100)}%</Text>
        </Modal>
      </Portal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
  },
  filterButton: {
    borderRadius: 20,
    marginRight: 8,
  },
  bulkButton: {
    borderRadius: 20,
  },
  analyticsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dateRangeLabel: {
    paddingHorizontal: 16,
    marginBottom: 4,
    fontSize: 12,
    color: "#666",
  },
  dateRangePicker: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: Platform.OS === "ios" ? 16 : 16,
  },
  exportModal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  exportTitle: {
    marginBottom: 8,
  },
  exportSubtitle: {
    marginBottom: 16,
    color: "#666",
    textAlign: "center",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6750A4",
  },
  exportProgress: {
    color: "#666",
  },
})
