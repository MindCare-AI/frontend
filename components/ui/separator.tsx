import React from 'react';
import { View, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

interface SeparatorProps {
  style?: any;
}

export const Separator: React.FC<SeparatorProps> = ({ style }) => {
  return (
    <View style={[styles.separator, style]} />
  );
};

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: globalStyles.colors.neutralMedium,
    marginVertical: globalStyles.spacing.sm,
    width: '100%',
  },
});
