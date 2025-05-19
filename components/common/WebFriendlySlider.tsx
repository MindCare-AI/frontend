import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';

interface WebFriendlySliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  style?: object;
}

// Simple wrapper component to handle platform differences
const WebFriendlySlider: React.FC<WebFriendlySliderProps> = (props) => {
  if (Platform.OS === 'web') {
    // Use a simple HTML input range for web to avoid react-dom.findDOMNode issues
    return (
      <input
        type="range"
        value={props.value}
        onChange={(e) => props.onValueChange(Number(e.target.value))}
        min={props.minimumValue}
        max={props.maximumValue}
        step={props.step}
        style={{
          width: '100%',
          height: 40,
          accentColor: props.minimumTrackTintColor || '#0d6efd',
          ...props.style,
        }}
      />
    );
  }

  // Use the regular Slider for native platforms
  return <Slider {...props} />;
};

export default WebFriendlySlider;
