import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface NavigationButtonProps {
  title: string;
  screenName: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onPress?: () => void;
}

export default function NavigationButton({ 
  title, 
  screenName, 
  icon,
  isActive = false,
  onPress
}: NavigationButtonProps) {
  const navigation = useNavigation<any>();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate(screenName);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isActive && styles.activeButton]} 
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected: isActive }}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <Text style={[styles.buttonText, isActive && styles.activeButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: 'rgba(0, 45, 98, 0.05)',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7A869A',
    marginTop: 4,
  },
  activeButtonText: {
    color: '#002D62',
    fontWeight: 'bold',
  },
  iconContainer: {
    marginBottom: 4,
  },
});
