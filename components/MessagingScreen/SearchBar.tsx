//screens/MessagingScreen/components/SearchBar.tsx
import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Define interface for component props
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleClear = () => {
    onChangeText('');
  };
  
  const containerBackground = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#007BFF', '#0062CC']
  });
  
  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.15]
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: containerBackground }]}>
      <Animated.View 
        style={[
          styles.searchContainer, 
          isFocused && styles.focusedContainer,
          { shadowOpacity: shadowOpacity }
        ]}
      >
        <Icon 
          name="search" 
          size={20} 
          color={isFocused ? "#007BFF" : "#667892"} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search conversations"
          placeholderTextColor="#8E9CB5"
          returnKeyType="search"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {value.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear} 
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <Icon name="close-circle" size={18} color="#8E9CB5" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#007BFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focusedContainer: {
    borderColor: '#007BFF',
    shadowColor: '#007BFF',
    shadowRadius: 8,
    elevation: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#3A4B66',
    height: '100%',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default SearchBar;