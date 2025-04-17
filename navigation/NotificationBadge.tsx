import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useNotificationCount } from '../hooks/notificationsScreen/useNotificationCount';

interface NotificationBadgeProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ navigation }) => {
  const { count, loading } = useNotificationCount();
  const scale = React.useRef(new Animated.Value(0)).current;
  const rotation = React.useRef(new Animated.Value(0)).current;
  const pulseScale = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      // Entrance animation
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();

      // Wiggle animation
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse animation
      const pulseAnimation = Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulseAnimation).start();
    } else {
      // Exit animation
      Animated.spring(scale, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      // Cleanup animations
      scale.setValue(0);
      rotation.setValue(0);
      pulseScale.setValue(1);
    };
  }, [count]);

  if (loading || count === 0) return null;

  return (
    <TouchableOpacity
      style={styles.badgeContainer}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Ionicons name="notifications-outline" size={24} color="#333" />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale },
              {
                rotate: rotation.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-30deg', '30deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.pulse,
            {
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
        <View style={styles.badge}>
          <Text style={styles.text}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    padding: 8,
  },
  container: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#EF4444',
    opacity: 0.2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      },
    }),
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});