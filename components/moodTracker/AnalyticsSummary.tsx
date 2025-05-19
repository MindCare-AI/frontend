"use client"
import { View, StyleSheet, Dimensions, Platform } from "react-native"
import { Card, Text, useTheme } from "react-native-paper"
import React from "react"
import { useMoodAnalytics } from "../../hooks/moodTracker/useMoodAnalytics"

// Import the LineChart only on non-web platforms
let LineChart: any = null
if (Platform.OS !== "web") {
  LineChart = require("react-native-chart-kit").LineChart
}

interface AnalyticsSummaryProps {
  style?: object;
  colors?: {
    primary: string;
    lightBlue: string;
    white: string;
    textDark: string;
    textMedium: string;
  };
}

export default function AnalyticsSummary({ 
  style,
  colors = {
    primary: '#002D62',
    lightBlue: '#E4F0F6',
    white: '#FFFFFF',
    textDark: '#333',
    textMedium: '#666',
  }
}: AnalyticsSummaryProps) {
  const theme = useTheme()
  const { 
    weeklyAverage, 
    monthlyAverage, 
    entryCount, 
    getFormattedTrends 
  } = useMoodAnalytics()

  const trendData = getFormattedTrends()
  
  // Prepare chart data
  const chartData = {
    labels: trendData.slice(0, 7).map(item => item.label.split(' ')[0]), // Get just the day name
    datasets: [
      {
        data: trendData.length ? 
          trendData.slice(0, 7).map(item => item.value) : 
          [5, 5, 5, 5, 5, 5, 5], // Default if no data
        color: () => colors.primary,
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
        <div className="web-chart" style={{
          width: "100%",
          height: 150,
          padding: 8,
          backgroundColor: colors.white,
          borderRadius: 8,
          boxSizing: "border-box" as "border-box",
        }}>
          <div style={{
            height: 20,
            position: "relative" as "relative",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}>
              {chartData.labels.map((label, index) => (
                <span key={index} style={{
                  fontSize: 10,
                  color: colors.textMedium,
                }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div style={{
            height: "calc(100% - 20px)",
            display: "flex",
            position: "relative" as "relative",
          }}>
            <div style={{
              width: 25,
              height: "100%",
              display: "flex",
              flexDirection: "column" as "column",
              justifyContent: "space-between",
            }}>
              {[10, 8, 6, 4, 2].map((value) => (
                <span key={value} style={{
                  fontSize: 10,
                  color: colors.textMedium,
                }}>
                  {value}
                </span>
              ))}
            </div>
            <div style={{
              flex: 1,
              position: "relative" as "relative",
              borderBottomWidth: 1,
              borderBottomStyle: "solid" as "solid",
              borderBottomColor: "#eee",
              height: "100%",
            }}>
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
                    backgroundColor: colors.primary,
                  }}
                />
              ))}
              <div style={{
                position: "absolute" as "absolute",
                width: "100%",
                height: "100%",
              }}>
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
                        backgroundColor: colors.primary,
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
            backgroundColor: colors.white,
            backgroundGradientFrom: colors.white,
            backgroundGradientTo: colors.white,
            decimalPlaces: 1,
            color: () => colors.primary,
            labelColor: () => colors.textMedium,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: colors.primary,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 8,
          }}
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
      <View style={{
        height: 150,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.lightBlue,
        borderRadius: 8,
        width: "100%",
      }}>
        <Text>Chart not available on this platform</Text>
      </View>
    )
  }

  return (
    <Card style={[{ borderRadius: 12, backgroundColor: colors.white }, style]}>
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: "bold", color: colors.textDark }}>
          Analytics
        </Text>
        <Text variant="bodySmall" style={{ color: colors.textMedium, marginBottom: 12 }}>
          Your mood patterns and trends
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="bodySmall" style={{ color: colors.textMedium, marginBottom: 4 }}>
              Weekly Avg
            </Text>
            <Text variant="headlineSmall" style={{ fontWeight: "bold", color: colors.primary }}>
              {weeklyAverage ? weeklyAverage.toFixed(1) : "N/A"}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="bodySmall" style={{ color: colors.textMedium, marginBottom: 4 }}>
              Monthly Avg
            </Text>
            <Text variant="headlineSmall" style={{ fontWeight: "bold", color: colors.primary }}>
              {monthlyAverage ? monthlyAverage.toFixed(1) : "N/A"}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="bodySmall" style={{ color: colors.textMedium, marginBottom: 4 }}>
              Total Entries
            </Text>
            <Text variant="headlineSmall" style={{ fontWeight: "bold", color: colors.primary }}>
              {entryCount}
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text variant="bodySmall" style={{ alignSelf: "flex-start", marginBottom: 8, color: colors.textMedium }}>
            Daily Mood Trend (Past Week)
          </Text>
          {renderChart()}
        </View>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  chartContainer: {
    alignItems: "center",
  },
})
