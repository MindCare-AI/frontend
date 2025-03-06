import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Properly type the icon names to match what Ionicons accepts
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SimpleNavigationAreaProps {
  currentScreen: string;
  onScreenChange: (screenName: string) => void;
}

type NavigationAreaProps = BottomTabBarProps | SimpleNavigationAreaProps;

const isTabBarProps = (props: NavigationAreaProps): props is BottomTabBarProps => {
  return 'state' in props && 'descriptors' in props && 'navigation' in props;
};

interface NavItem {
  title: string;
  screenName: string;
  icon: IoniconsName;
  activeIcon: IoniconsName;
}

const NavigationArea = (props: NavigationAreaProps) => {
  const navItems: NavItem[] = [
    { title: 'Feeds', screenName: 'Feeds', icon: 'home-outline', activeIcon: 'home' },
    { title: 'Chatbot', screenName: 'Chatbot', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
    { title: 'Notifications', screenName: 'Notifications', icon: 'notifications-outline', activeIcon: 'notifications' },
    { title: 'Settings', screenName: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
  ];

  if (isTabBarProps(props)) {
    const { state, descriptors, navigation } = props;
    return (
      <View style={styles.container}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.index === index;
            const item = navItems.find(i => i.screenName === route.name) || navItems[index];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={index}
                style={[styles.navButton, isFocused && styles.activeNavButton]}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
              >
                {isFocused && <View style={styles.activeIndicator} />}
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={isFocused ? item.activeIcon : item.icon} 
                    size={24} 
                    color={isFocused ? '#FFFFFF' : '#B0C4DE'} 
                  />
                </View>
                <Text 
                  style={[
                    styles.navText, 
                    isFocused && styles.activeNavText
                  ]}
                >
                  {label as string}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  } else {
    const { currentScreen, onScreenChange } = props;
    return (
      <View style={styles.container}>
        <View style={styles.tabBar}>
          {navItems.map((item, index) => {
            const isActive = currentScreen === item.screenName;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.navButton, isActive && styles.activeNavButton]}
                onPress={() => onScreenChange(item.screenName)}
              >
                {isActive && <View style={styles.activeIndicator} />}
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={isActive ? item.activeIcon : item.icon} 
                    size={24} 
                    color={isActive ? '#FFFFFF' : '#B0C4DE'} 
                  />
                </View>
                <Text style={[styles.navText, isActive && styles.activeNavText]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#002D62',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      android: { 
        elevation: 15,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { 
          width: 0, 
          height: -4 
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      web: { 
        boxShadow: '0px -4px 10px rgba(0,0,0,0.15)' 
      },
    }),
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    position: 'relative',
  },
  activeNavButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: '40%',
    height: 4,
    backgroundColor: '#64B5F6',
    borderRadius: 2,
  },
  iconContainer: {
    marginBottom: 6,
    padding: 6,
  },
  navText: {
    color: '#B0C4DE',
    fontSize: 12,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default NavigationArea;
