import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationCardProps {
  type?: 'success' | 'info' | 'warning' | 'error';
  message: string;
  description?: string;
  onClose?: () => void;
  style?: object;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  type = 'info',
  message,
  description = '',
  onClose,
  style,
}) => {
  // Light blue scheme
  const cardColors = {
    success: { bg: '#E6F3FA', icon: 'checkmark-circle' as const, iconColor: '#0088CC' },
    info: { bg: '#E6F3FA', icon: 'information-circle' as const, iconColor: '#0088CC' },
    warning: { bg: '#FFF8E1', icon: 'warning' as const, iconColor: '#FFA000' },
    error: { bg: '#FFEBEE', icon: 'alert-circle' as const, iconColor: '#D32F2F' },
  };

  const { bg, icon, iconColor } = cardColors[type];

  return (
    <View style={[styles.card, { backgroundColor: '#FFFFFF' }, style]}>
      <View style={[styles.waveBackground, { backgroundColor: bg }]} />

      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.messageText}>{message}</Text>
        {description ? <Text style={styles.subText}>{description}</Text> : null}
      </View>

      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={18} color="#777777" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
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
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '95%',
    alignSelf: 'center',
    minHeight: 80,
  },
  waveBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
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
    color: '#333333',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#666666',
  },
  closeButton: {
    padding: 4,
  },
});

export default NotificationCard;
