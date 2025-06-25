import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Badge, useTheme } from 'react-native-paper';
import { Notification } from '../../types/notifications';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Notification type and priority should match backend API
// id, type, title, message, timestamp, priority, read

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const theme = useTheme();

  // Updated color palette with light blue focus
  const priorityColors: Record<'low' | 'medium' | 'high' | 'critical', string> = {
    low: '#4CAF50',
    medium: '#0088CC', // Light blue
    high: '#FF9800',
    critical: '#f44336',
  };

  // Use timestamp field from backend, fallback to created_at for backward compatibility
  const timestamp = notification.timestamp || notification.created_at;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: notification.read
            ? '#FFFFFF'
            : '#E6F3FA', // Very light blue for unread notifications
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Notification: ${notification.title}`}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            variant="titleSmall"
            style={[
              styles.title,
              { color: notification.read ? '#333333' : '#0088CC' },
            ]}
          >
            {notification.title}
          </Text>
          <Badge
            size={8}
            style={[
              styles.priorityDot,
              { backgroundColor: priorityColors[notification.priority] },
            ]}
          />
        </View>
        <Text variant="bodyMedium" style={styles.message}>
          {notification.message}
        </Text>
        <Text variant="labelSmall" style={styles.time}>
          {timestamp ? new Date(timestamp).toLocaleString() : ''}
        </Text>
      </View>
      {!notification.read && (
        <Icon
          name="fiber-manual-record"
          size={16}
          color="#0088CC" // Light blue
          style={styles.unreadIndicator}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  priorityDot: {
    marginRight: 8,
  },
  message: {
    marginBottom: 4,
    color: '#555555',
  },
  time: {
    color: '#777777',
  },
  unreadIndicator: {
    alignSelf: 'center',
  },
});