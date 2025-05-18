import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SectionHeaderProps {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => {
  return (
    <View style={styles.header}>
      <MaterialCommunityIcons name={icon} size={24} color="white" style={styles.icon} />
      <Title style={styles.title}>{title}</Title>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003366',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    color: 'white',
    fontSize: 18,
  },
});

export default SectionHeader;