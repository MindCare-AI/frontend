import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/global';

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
  // Use theme colors from globalStyles
  const cardColors = {
    success: { bg: `${globalStyles.colors.success}20`, icon: 'checkmark-circle' as const, iconColor: globalStyles.colors.success },
    info: { bg: `${globalStyles.colors.primary}20`, icon: 'information-circle' as const, iconColor: globalStyles.colors.primary },
    warning: { bg: `${globalStyles.colors.accent}20`, icon: 'warning' as const, iconColor: globalStyles.colors.accent },
    error: { bg: `${globalStyles.colors.error}20`, icon: 'alert-circle' as const, iconColor: globalStyles.colors.error },
  };

  const { bg, icon, iconColor } = cardColors[type];

  return (
    <View style={[styles.card, { backgroundColor: globalStyles.colors.white }, style]}>
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
          <Ionicons name="close" size={18} color={globalStyles.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: globalStyles.colors.white,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: globalStyles.colors.shadow,
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
    borderColor: globalStyles.colors.border,
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
    color: globalStyles.colors.text,
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
});

export default NotificationCard;
