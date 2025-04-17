//screens/SettingsScreen/MedicalHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button, Alert } from 'react-native';
import axios from 'axios';

type MedicalHistoryRecord = {
  id: number;
  condition: string;
  description: string;
  date_diagnosed: string;
};

export const MedicalHistoryScreen: React.FC = () => {
  const [records, setRecords] = useState<MedicalHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Replace with your actual API base URL and auth token logic
  const API_BASE = 'http://<host>';
  const AUTH_TOKEN = ''; // Get from context or storage

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get<MedicalHistoryRecord[]>(`${API_BASE}/patient/medical-history/`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      setRecords(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load medical history');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/patient/medical-history/${id}/`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      setRecords(records.filter(r => r.id !== id));
    } catch (e) {
      Alert.alert('Error', 'Failed to delete record');
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
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Medical History</Text>
      <FlatList
        data={records}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.condition}</Text>
            <Text>{item.description}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>Diagnosed: {item.date_diagnosed}</Text>
            <Button title="Delete" color="red" onPress={() => deleteRecord(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text>No medical history records found.</Text>}
        refreshing={loading}
        onRefresh={fetchRecords}
      />
      {/* Add button and modal for creating new records can be added here */}
    </View>
  );
};