import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useNotificationCount } from '../hooks/notificationsScreen/useNotificationCount';
import { globalStyles } from '../styles/global';
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
        style={{ padding: globalStyles.spacing.sm }}
        onPress={() => navigation.navigate('Notifications')}>
        <Ionicons name="notifications-outline" size={24} color={globalStyles.colors.textPrimary} />
        <Animated.View
          style={{
            position: 'absolute',
            top: -globalStyles.spacing.xs,
            right: -globalStyles.spacing.xs,
            minWidth: globalStyles.spacing.md,
            height: globalStyles.spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              { scale },
              {
                rotate: rotation.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-30deg', '30deg'],
                }),
              },
            ],
          }}>
          <Animated.View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: globalStyles.spacing.xs,
              backgroundColor: globalStyles.colors.error,
              opacity: 0.2,
              transform: [{ scale: pulseScale }],
            }}
          />
          <View
            style={{
              minWidth: globalStyles.spacing.md,
              height: globalStyles.spacing.md,
              borderRadius: globalStyles.spacing.xs,
              backgroundColor: globalStyles.colors.error,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: globalStyles.spacing.xxs,
              shadowColor: globalStyles.colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 3,
            }}>
            <Text
              style={{
                ...globalStyles.bodyBold,
                fontSize: 12,
                color: globalStyles.colors.white,
              }}>
              {count > 99 ? '99+' : count}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
  );