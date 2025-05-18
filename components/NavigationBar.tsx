import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationBarProps {
  routes: {
    name: string;
    icon: React.ReactNode;
    label: string;
  }[];
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ routes }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const fadeAnims = React.useRef(
    routes.map(() => new Animated.Value(0))
  ).current;
  const scaleAnims = React.useRef(
    routes.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    // Animate the initial active tab
    const activeIndex = routes.findIndex(r => r.name === route.name);
    if (activeIndex >= 0) {
      Animated.spring(fadeAnims[activeIndex], {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    }
  }, []);

  const handlePress = (routeName: string, index: number) => {
    // Reset all animations
    fadeAnims.forEach((anim, i) => {
      if (i !== index) {
        Animated.spring(anim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    });

    // Animate the pressed tab
    Animated.sequence([
      Animated.spring(scaleAnims[index], {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.spring(fadeAnims[index], {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
      ]),
    ]).start();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    navigation.navigate(routeName);
  };

  return (
    <View style={styles.container}>
      {routes.map((route, index) => {
        const isActive = route.name === route.name;

        return (
          <TouchableOpacity
            key={route.name}
            onPress={() => handlePress(route.name, index)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={route.label}
            accessibilityState={{ selected: isActive }}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              {route.icon}
              <Animated.View
                style={[
                  styles.activeDot,
                  {
                    opacity: fadeAnims[index],
                    transform: [
                      {
                        scale: fadeAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </Animated.View>
            <Animated.Text
              style={[
                styles.label,
                {
                  color: fadeAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['#6B7280', '#002D62'],
                  }),
                },
              ]}
              numberOfLines={1}
            >
              {route.label}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    padding: 8,
    marginBottom: 2,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#002D62',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
