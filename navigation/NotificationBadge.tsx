import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useNotificationCount } from '../screens/notificationsScreen/hooks/useNotificationCount';

interface NotificationBadgeProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ navigation }) => {
  const { count, loading } = useNotificationCount();

  return (
    <TouchableOpacity
      style={styles.badgeContainer}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Ionicons name="notifications-outline" size={24} color="#333" />
      {!loading && count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    padding: 8,
  },
  badge: {
    position: 'absolute',
    right: 2,
    top: 2,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});