import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Badge, useTheme } from 'react-native-paper';
import { Notification } from '../../../types/notifications';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onPress 
}) => {
  const theme = useTheme();
  
  const priorityColors: Record<'low' | 'medium' | 'high' | 'critical', string> = {
    low: '#4CAF50', // green
    medium: theme.colors.primary, // existing color
    high: '#FF9800', // orange
    critical: theme.colors.error, // existing color
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor: notification.read ? theme.colors.background : theme.colors.surfaceVariant }
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleSmall" style={styles.title}>
            {notification.title}
          </Text>
          <Badge 
            size={8} 
            style={[styles.priorityDot, { backgroundColor: priorityColors[notification.priority] }]} 
          />
        </View>
        <Text variant="bodyMedium" style={styles.message}>
          {notification.message}
        </Text>
        <Text variant="labelSmall" style={styles.time}>
          {new Date(notification.created_at).toLocaleString()}
        </Text>
      </View>
      {!notification.read && (
        <Icon 
          name="fiber-manual-record" 
          size={16} 
          color={theme.colors.primary} 
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
    marginVertical: 4,
    borderRadius: 8,
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
  },
  time: {
    color: '#666',
  },
  unreadIndicator: {
    alignSelf: 'center',
  },
});