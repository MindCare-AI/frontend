import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl, 
  Alert, 
  SafeAreaView, 
  Dimensions,
  Platform
} from 'react-native';
import { Text, Appbar, Button, useTheme } from 'react-native-paper';
import { NotificationItem } from '../../components/notificationsScreen/NotificationItem';
import { NotificationTypeFilter } from '../../components/notificationsScreen/NotificationTypeFilter';
import { useNotifications } from '../../hooks/notificationsScreen/useNotifications';
import { useMarkAllRead } from '../../hooks/notificationsScreen/useMarkAllRead';
import { NOTIFICATION_TYPES } from './constants';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationsScreenProps {
  navigation: NavigationProp<RootStackParamList, 'Notifications'>;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notifications as read';
      Alert.alert('Error', errorMessage, [
        { text: 'OK', style: 'cancel' },
        { text: 'Retry', onPress: handleMarkAllRead }
      ]);
    }
  };

  const handleNotificationPress = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      navigation.navigate('NotificationDetail', { id: notificationId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as read';
      Alert.alert('Error', errorMessage);
    }
  };

  // Use backend types if present, otherwise fallback to static
  const typeOptions = backendTypes && backendTypes.length > 0 ? backendTypes : NOTIFICATION_TYPES;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]}>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#0088CC" />
          <Appbar.Content title="Notifications" titleStyle={styles.headerTitle} />
          <Appbar.Action 
            icon="check-all" 
            color="#0088CC"
            onPress={handleMarkAllRead} 
            disabled={
              Array.isArray(notifications)
                ? notifications.length === 0 || notifications.every(n => n.read)
                : true
            }
          />
        </Appbar.Header>

        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            <NotificationTypeFilter
              types={typeOptions}
              selectedType={selectedType}
              onSelectType={setSelectedType}
            />
          </ScrollView>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0088CC" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained" 
              onPress={refreshNotifications}
              style={styles.retryButton}
              buttonColor="#0088CC"
              icon="refresh"
            >
              Try Again
            </Button>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Button 
              mode="text" 
              onPress={refreshNotifications}
              style={styles.refreshButton}
              textColor="#0088CC"
              icon="refresh"
            >
              Refresh
            </Button>
          </View>
        ) : (
          <ScrollView
            style={styles.notificationsList}
            contentContainerStyle={[
              styles.notificationsContent,
              { minHeight: windowHeight * 0.5 }
            ]}
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshNotifications}
                colors={["#0088CC"]}
                tintColor="#0088CC"
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
            <View style={{ height: insets.bottom + 20 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    color: '#0088CC',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  filterScrollContent: {
    paddingHorizontal: 8,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  refreshButton: {
    marginTop: 16,
  },
});