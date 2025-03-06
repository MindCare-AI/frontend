import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useNavigation, useRoute, NavigationProp, ParamListBase } from '@react-navigation/native';
import NavigationButton from './NavigationButton';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface NavItem {
  title: string;
  screenName: string;
  icon: IoniconsName;
  activeIcon: IoniconsName;
}

interface NavigationBarProps {
  items?: NavItem[];
  position?: 'top' | 'bottom';
  currentScreen?: string;
}

export default function NavigationBar({ 
  items, 
  position = 'bottom',
  currentScreen 
}: NavigationBarProps) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute();
  
  const defaultNavItems: NavItem[] = [
    { title: 'Feeds', screenName: 'Feeds', icon: 'home-outline', activeIcon: 'home' },
    { title: 'Chatbot', screenName: 'Chatbot', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
    { title: 'Notifications', screenName: 'Notifications', icon: 'notifications-outline', activeIcon: 'notifications' },
    { title: 'Settings', screenName: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
  ];
  
  const navItems = items || defaultNavItems;
  const activeScreen = currentScreen || route.name;

  return (
    <View style={[
      styles.container, 
      position === 'top' ? styles.top : styles.bottom,
      getContainerShadowStyle(position)
    ]}>
      {navItems.map((item, index) => {
        const isActive = activeScreen === item.screenName;
        
        return (
          <View key={index} style={styles.buttonContainer}>
            <NavigationButton 
              title={item.title} 
              screenName={item.screenName} 
              icon={
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? '#002D62' : '#7A869A'}
                />
              }
              isActive={isActive}
              onPress={() => {
                if (item.screenName) {
                  navigation.navigate(item.screenName);
                }
              }}
            />
            {isActive && <View style={styles.activeIndicator} />}
          </View>
        );
      })}
    </View>
  );
}

const getContainerShadowStyle = (position: 'top' | 'bottom'): ViewStyle => {
  if (Platform.OS === 'android') {
    return { elevation: 8 };
  }
  
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: { 
        width: 0, 
        height: position === 'top' ? 2 : -2 
      },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    };
  }
  
  return {
    boxShadow: position === 'top' 
      ? '0px 2px 6px rgba(0,0,0,0.1)' 
      : '0px -2px 6px rgba(0,0,0,0.1)'
  };
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  top: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bottom: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -12,
    width: '30%',
    height: 3,
    backgroundColor: '#002D62',
    borderRadius: 1.5,
  },
});
