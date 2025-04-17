import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Appbar, Button, Divider, useTheme } from 'react-native-paper';
import { NotificationItem } from '../../components/notificationsScreen/NotificationItem';
import { NotificationTypeFilter } from '../../components/notificationsScreen/NotificationTypeFilter';
import { useNotifications } from '../../hooks/notificationsScreen/useNotifications';
import { useMarkAllRead } from '../../hooks/notificationsScreen/useMarkAllRead';
import { NOTIFICATION_TYPES } from './constants';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

interface NotificationsScreenProps {
  navigation: NavigationProp<RootStackParamList, 'Notifications'>;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Use backend types if available, otherwise fallback to static
  const {
    notifications,
    loading,
    error,
    refreshing,
    refreshNotifications,
    markAsRead,
    types: backendTypes,
  } = useNotifications(selectedType);

  const { markAllRead } = useMarkAllRead();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      refreshNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationPress = (notificationId: number) => {
    markAsRead(notificationId);
    navigation.navigate('NotificationDetail', { id: notificationId });
  };

  // Use backend types if present, otherwise fallback to static
  const typeOptions = backendTypes && backendTypes.length > 0 ? backendTypes : NOTIFICATION_TYPES;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notifications" />
        <Appbar.Action 
          icon="check-all" 
          onPress={handleMarkAllRead} 
          disabled={
            Array.isArray(notifications)
              ? notifications.length === 0 || notifications.every(n => n.read)
              : true
          }
        />
      </Appbar.Header>

      <NotificationTypeFilter
        types={typeOptions}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={refreshNotifications}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications found</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshNotifications}
              colors={[theme.colors.primary]}
            />
          }
        >
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(parseInt(notification.id))}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    color: '#f44336',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    marginTop: 16,
  },
});