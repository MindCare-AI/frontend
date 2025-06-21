import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: globalStyles.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
    lineHeight: 20,
  },
});