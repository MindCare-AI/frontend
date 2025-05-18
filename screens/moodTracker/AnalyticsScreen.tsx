"use client"
import { View, StyleSheet, ScrollView, Dimensions } from "react-native"
import { useTheme, Text, Card, Button } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { LineChart, BarChart, PieChart } from "react-native-chart-kit"

export default function AnalyticsScreen() {
  const theme = useTheme()
  const screenWidth = Dimensions.get("window").width - 32 // Adjust for padding

  // Mock data for charts
  const weeklyMoodData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [6.5, 7.2, 5.8, 8.1, 7.5, 9.0, 8.3],
        color: () => theme.colors.primary,
        strokeWidth: 2,
      },
    ],
  }

  const monthlyMoodData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        data: [7.2, 6.8, 8.1, 7.9],
      },
    ],
  }

  const activityData = [
    {
      name: "Exercise",
      count: 8,
      color: "#FF5733",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Reading",
      count: 6,
      color: "#33FF57",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Working",
      count: 12,
      color: "#3357FF",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Socializing",
      count: 9,
      color: "#F3FF33",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Other",
      count: 7,
      color: "#FF33F3",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ]

  const chartConfig = {
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
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Analytics
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="bodySmall">Weekly Average</Text>
              <Text variant="headlineMedium">7.49</Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="bodySmall">Monthly Average</Text>
              <Text variant="headlineMedium">7.21</Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="bodySmall">Total Entries</Text>
              <Text variant="headlineMedium">42</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Daily Mood Trend (Past Week)
            </Text>
            <LineChart
              data={weeklyMoodData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLines={false}
              yAxisLabel=""
              yAxisSuffix=""
              yAxisInterval={2}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Monthly Mood Trend
            </Text>
            <BarChart
              data={monthlyMoodData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: () => theme.colors.secondary,
              }}
              style={styles.chart}
              withInnerLines={false}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Activities Distribution
            </Text>
            <PieChart
              data={activityData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>

        <View style={styles.exportContainer}>
          <Button mode="contained" icon="download" onPress={() => alert("Exporting analytics data...")}>
            Export Analytics Data
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    padding: 16,
  },
  title: {
    fontWeight: "bold",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 0,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  chartTitle: {
    marginBottom: 16,
    fontWeight: "bold",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  exportContainer: {
    padding: 16,
    marginBottom: 16,
  },
})
