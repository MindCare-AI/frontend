import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OfflineNotice = () => (
  <View style={styles.container}>
    <Text style={styles.text}>No Internet Connection</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff3b30',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
});

export default OfflineNotice;
