import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const OfflineNotice = () => (
  <View style={styles.container}>
    <Icon name="cloud-offline" size={16} color="#fff" style={styles.icon} />
    <Text style={styles.text}>You are offline</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF3B30',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default OfflineNotice;
