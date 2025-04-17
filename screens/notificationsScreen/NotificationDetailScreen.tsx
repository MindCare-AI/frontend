import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

const NotificationDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  const { id } = route.params;
  const { accessToken } = useAuth();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch notification: ${response.status}`);
        }
        const data = await response.json();
        setNotification(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notification');
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [id, accessToken]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !notification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Notification Detail</Text>
        <Text style={{ color: 'red' }}>{error || 'Notification not found.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{notification.title || 'Notification Detail'}</Text>
      <Text style={styles.label}>Type: {notification.type}</Text>
      <Text style={styles.label}>Message: {notification.message}</Text>
      <Text style={styles.label}>Priority: {notification.priority}</Text>
      <Text style={styles.label}>Timestamp: {notification.timestamp}</Text>
      <Text style={styles.label}>ID: {notification.id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 16, marginBottom: 6 },
});

export default NotificationDetailScreen;