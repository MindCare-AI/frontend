import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createBoxShadow } from '../../utils/shadows';

interface ConversationHeaderProps {
  title?: string;
  onSettingsPress?: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ 
  title = 'Messages',
  onSettingsPress 
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor="#002D62" />
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Stay connected with your conversations</Text>
        </View>
        
        {onSettingsPress && (
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={onSettingsPress}
            accessibilityLabel="Messaging settings"
          >
            <Ionicons name="settings-outline" size={24} color="#002D62" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#002D62',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    ...createBoxShadow(0, 2, 4, 'rgba(0, 45, 98, 0.2)', 2),
  },
});

export default ConversationHeader;
