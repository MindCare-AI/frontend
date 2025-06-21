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
import { globalStyles } from '../../styles/global';

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: globalStyles.colors.background }]}>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} iconColor={globalStyles.colors.primary} />
          <Appbar.Content title="Notifications" titleStyle={styles.headerTitle} />
          <Appbar.Action 
            icon="check-all" 
            iconColor={globalStyles.colors.primary}
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
            <ActivityIndicator size="large" color={globalStyles.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained" 
              onPress={refreshNotifications}
              style={styles.retryButton}
              buttonColor={globalStyles.colors.primary}
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
              textColor={globalStyles.colors.primary}
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
                colors={[globalStyles.colors.primary]}
                tintColor={globalStyles.colors.primary}
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
    backgroundColor: globalStyles.colors.background,
  },
  header: {
    backgroundColor: globalStyles.colors.white,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: globalStyles.colors.border,
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    color: globalStyles.colors.primary,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: globalStyles.colors.white,
    zIndex: 1,
    paddingVertical: 8,
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
    backgroundColor: globalStyles.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: globalStyles.colors.background,
  },
  errorText: {
    marginBottom: 20,
    color: globalStyles.colors.error,
    textAlign: 'center',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: globalStyles.colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: globalStyles.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: globalStyles.colors.primary,
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: globalStyles.colors.primary,
  },
});