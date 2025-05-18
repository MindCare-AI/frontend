"use client"
import { View, StyleSheet, Dimensions, Platform } from "react-native"
import { Card, Text, useTheme } from "react-native-paper"
import React from "react"

// Import the LineChart only on non-web platforms
let LineChart: any = null
if (Platform.OS !== "web") {
  LineChart = require("react-native-chart-kit").LineChart
}

interface AnalyticsSummaryProps {
  style?: object
}

export default function AnalyticsSummary({ style }: AnalyticsSummaryProps) {
  const theme = useTheme()

  // Mock data for analytics
  const weeklyAverage = 7.49
  const monthlyAverage = 7.21
  const totalEntries = 42

  // Mock data for chart
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [6.5, 7.2, 5.8, 8.1, 7.5, 9.0, 8.3],
        color: () => theme.colors.primary,
        strokeWidth: 2,
      },
    ],
  }

  const screenWidth = Dimensions.get("window").width - 32 // Adjust for padding

  // Render native chart for mobile or alternative for web
  const renderChart = () => {
    if (Platform.OS === "web") {
      // Basic web-friendly chart visualization
      return (
        <div className="web-chart" style={webStyles.chartContainer}>
          <div style={webStyles.chartHeader}>
            <div style={webStyles.xAxisLabels}>
              {chartData.labels.map((label, index) => (
                <span key={index} style={webStyles.xAxisLabel}>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div style={webStyles.chartBody}>
            <div style={webStyles.yAxis}>
              {[10, 8, 6, 4, 2].map((value) => (
                <span key={value} style={webStyles.yAxisLabel}>
                  {value}
                </span>
              ))}
            </div>
            <div style={webStyles.chartCanvas}>
              {chartData.datasets[0].data.map((value, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    transform: "translate(-4px, 4px)",
                    left: `${(index * 100) / (chartData.labels.length - 1)}%`,
                    bottom: `${(value / 10) * 100}%`,
                    backgroundColor: theme.colors.primary,
                  }}
                />
              ))}
              <div style={webStyles.chartLine}>
                {chartData.datasets[0].data.map((value, index) =>
                  index < chartData.datasets[0].data.length - 1 ? (
                    <div
                      key={index}
                      style={{
                        position: "absolute",
                        left: `${(index * 100) / (chartData.labels.length - 1)}%`,
                        width: `${100 / (chartData.labels.length - 1)}%`,
                        bottom: `${(value / 10) * 100}%`,
                        height: `${Math.abs(
                          ((value - chartData.datasets[0].data[index + 1]) / 10) *
                            100
                        )}%`,
                        transform:
                          value < chartData.datasets[0].data[index + 1]
                            ? "skewX(25deg)"
                            : "skewX(-25deg)",
                        backgroundColor: theme.colors.primary,
                        transformOrigin: "bottom left",
                      }}
                    />
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Native chart implementation
    if (LineChart) {
      return (
        <LineChart
          data={chartData}
          width={screenWidth - 32} // Adjust for card padding
          height={150}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 1,
            color: () => theme.colors.primary,
            labelColor: () => "#666",
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: theme.colors.primary,
            },
          }}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
          withVerticalLines={false}
          yAxisLabel=""
          yAxisSuffix=""
          yAxisInterval={2}
        />
      )
    }

    // Fallback if LineChart is not available
    return (
      <View style={styles.fallbackChart}>
        <Text>Chart not available on this platform</Text>
      </View>
    )
  }

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Analytics
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Your mood patterns and trends
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="bodySmall" style={styles.statLabel}>
              Weekly Avg
            </Text>
            <Text variant="headlineSmall" style={styles.statValue}>
              {weeklyAverage.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="bodySmall" style={styles.statLabel}>
              Monthly Avg
            </Text>
            <Text variant="headlineSmall" style={styles.statValue}>
              {monthlyAverage.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="bodySmall" style={styles.statLabel}>
              Total Entries
            </Text>
            <Text variant="headlineSmall" style={styles.statValue}>
              {totalEntries}
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text variant="bodySmall" style={styles.chartLabel}>
            Daily Mood Trend (Past Week)
          </Text>
          {renderChart()}
        </View>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontWeight: "bold",
  },
  chartContainer: {
    alignItems: "center",
  },
  chartLabel: {
    alignSelf: "flex-start",
    marginBottom: 8,
    color: "#666",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  fallbackChart: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "100%",
  },
})

// Web-specific styles using JavaScript objects
const webStyles = {
  chartContainer: {
    width: "100%",
    height: 150,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    boxSizing: "border-box" as "border-box",
  },
  chartHeader: {
    height: 20,
    position: "relative" as "relative",
  },
  xAxisLabels: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  xAxisLabel: {
    fontSize: 10,
    color: "#666",
  },
  chartBody: {
    height: "calc(100% - 20px)",
    display: "flex",
    position: "relative" as "relative",
  },
  yAxis: {
    width: 25,
    height: "100%",
    display: "flex",
    flexDirection: "column" as "column",
    justifyContent: "space-between",
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#666",
  },
  chartCanvas: {
    flex: 1,
    position: "relative" as "relative",
    borderBottomWidth: 1,
    borderBottomStyle: "solid" as "solid",
    borderBottomColor: "#eee",
    height: "100%",
  },
  chartLine: {
    position: "absolute" as "absolute",
    width: "100%",
    height: "100%",
  },
}
