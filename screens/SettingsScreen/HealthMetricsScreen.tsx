//screens/SettingsScreen/HealthMetricsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button, Alert } from 'react-native';
import axios from 'axios';

type HealthMetric = {
  id: number;
  metric_name: string;
  value: string;
  unit: string;
  created_at: string;
  updated_at: string;
};

export const HealthMetricsScreen: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Replace with your actual API base URL and auth token logic
  const API_BASE = 'http://<host>';
  const AUTH_TOKEN = ''; // Get from context or storage

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await axios.get<HealthMetric[]>(`${API_BASE}/patient/health-metrics/`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      setMetrics(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load health metrics');
    } finally {
      setLoading(false);
    }
  };

  const deleteMetric = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/patient/health-metrics/${id}/`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      setMetrics(metrics.filter(m => m.id !== id));
    } catch (e) {
      Alert.alert('Error', 'Failed to delete metric');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Health Metrics</Text>
      <FlatList
        data={metrics}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.metric_name}</Text>
            <Text>
              {item.value} {item.unit}
            </Text>
            <Text style={{ color: '#888', fontSize: 12 }}>Created: {item.created_at}</Text>
            <Button title="Delete" color="red" onPress={() => deleteMetric(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text>No health metrics found.</Text>}
        refreshing={loading}
        onRefresh={fetchMetrics}
      />
      {/* Add button and modal for creating new metrics can be added here */}
    </View>
  );
};