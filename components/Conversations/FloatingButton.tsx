import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Use the correct type for Ionicons names
type IoniconsNames = React.ComponentProps<typeof Ionicons>['name'];

interface FloatingButtonProps {
  onPress: () => void;
  icon?: IoniconsNames; // Now using the proper type for Ionicons
  color?: string;
  style?: any;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  icon = 'create-outline',
  color = '#FFFFFF',
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name={icon} size={24} color={color} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 999,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#002D62',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default FloatingButton;
