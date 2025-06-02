import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.waveBackground} />

      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={20} color="#269b24" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.messageText}>Success message</Text>
        <Text style={styles.subText}>Everything seems great</Text>
      </View>

      <TouchableOpacity>
        <Ionicons name="close" size={18} color="#555" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  waveBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#04e4003a',
    borderRadius: 20,
  },
  iconContainer: {
    marginRight: 12,
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
    zIndex: 1,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#666',
  },
});

export default NotificationCard;
