import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginBottom: subtitle ? 4 : 0 }]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: globalStyles.colors.primary,
    // Moving the dynamic marginBottom to the component render
  },
  subtitle: {
    fontSize: 14,
    color: globalStyles.colors.secondary,
  },
});

export default SectionHeader;