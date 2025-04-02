import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  const { id } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Detail</Text>
      <Text>Notification ID: {id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});

export default NotificationDetailScreen;