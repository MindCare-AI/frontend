import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { List, Divider } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { createBoxShadow } from '../../utils/shadows';
import { MessagingSettingsScreenNavigationProp, MessagingSettingsScreenRouteProp } from '../../navigation/types';

interface MessagingSettingsScreenProps {
  navigation: MessagingSettingsScreenNavigationProp;
  route: MessagingSettingsScreenRouteProp;
}

interface ConversationSettings {
  notifications: boolean;
  sounds: boolean;
  vibration: boolean;
  media_auto_download: boolean;
  read_receipts: boolean;
  typing_indicators: boolean;
  message_preview: boolean;
  archived: boolean;
  muted: boolean;
  mute_until?: string;
}

interface GlobalSettings {
  default_notifications: boolean;
  default_sounds: boolean;
  default_vibration: boolean;
  default_media_auto_download: boolean;
  default_read_receipts: boolean;
  default_typing_indicators: boolean;
  backup_messages: boolean;
  delete_messages_after: number; // days
}

const MessagingSettingsScreen: React.FC<MessagingSettingsScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { user, accessToken } = useAuth();
  const { conversationId, conversationType } = route.params || {};
  
  const [conversationSettings, setConversationSettings] = useState<ConversationSettings>({
    notifications: true,
    sounds: true,
    vibration: true,
    media_auto_download: true,
    read_receipts: true,
    typing_indicators: true,
    message_preview: true,
    archived: false,
    muted: false,
  });

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    default_notifications: true,
    default_sounds: true,
    default_vibration: true,
    default_media_auto_download: true,
    default_read_receipts: true,
    default_typing_indicators: true,
    backup_messages: true,
    delete_messages_after: 30,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [conversationInfo, setConversationInfo] = useState<any>(null);

  useEffect(() => {
    loadSettings();
    if (conversationId) {
      loadConversationInfo();
    }
  }, [conversationId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load global messaging settings
      const globalResponse = await fetch(`${API_URL}/messaging/settings/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (globalResponse.ok) {
        const globalData = await globalResponse.json();
        setGlobalSettings(globalData);
      }

      // Load conversation-specific settings if conversationId is provided
      if (conversationId) {
        const endpoint = conversationType === 'group' 
          ? `${API_URL}/messaging/groups/${conversationId}/settings/`
          : `${API_URL}/messaging/one_to_one/${conversationId}/settings/`;
          
        const convResponse = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (convResponse.ok) {
          const convData = await convResponse.json();
          setConversationSettings(convData);
        }
      }
    } catch (error) {
      console.error('Error loading messaging settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationInfo = async () => {
    try {
      const endpoint = conversationType === 'group'
        ? `${API_URL}/messaging/groups/${conversationId}/`
        : `${API_URL}/messaging/one_to_one/${conversationId}/`;
        
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversationInfo(data);
      }
    } catch (error) {
      console.error('Error loading conversation info:', error);
    }
  };

  const saveConversationSettings = async (settings: Partial<ConversationSettings>) => {
    if (!conversationId) return;
    
    try {
      setSaving(true);
      const endpoint = conversationType === 'group'
        ? `${API_URL}/messaging/groups/${conversationId}/settings/`
        : `${API_URL}/messaging/one_to_one/${conversationId}/settings/`;
        
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        const updatedSettings = await response.json();
        setConversationSettings(updatedSettings);
        Alert.alert('Success', 'Settings updated successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving conversation settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveGlobalSettings = async (settings: Partial<GlobalSettings>) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/messaging/settings/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        const updatedSettings = await response.json();
        setGlobalSettings(updatedSettings);
        Alert.alert('Success', 'Global settings updated successfully');
      } else {
        throw new Error('Failed to save global settings');
      }
    } catch (error) {
      console.error('Error saving global settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleConversationSettingChange = (key: keyof ConversationSettings, value: boolean) => {
    const newSettings = { ...conversationSettings, [key]: value };
    setConversationSettings(newSettings);
    saveConversationSettings({ [key]: value });
  };

  const handleGlobalSettingChange = (key: keyof GlobalSettings, value: boolean | number) => {
    const newSettings = { ...globalSettings, [key]: value };
    setGlobalSettings(newSettings);
    saveGlobalSettings({ [key]: value });
  };

  const muteConversation = (duration: number | null) => {
    const muteUntil = duration ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString() : undefined;
    handleConversationSettingChange('muted', duration !== null);
    if (duration !== null) {
      saveConversationSettings({ muted: true, mute_until: muteUntil });
    }
  };

  const archiveConversation = () => {
    Alert.alert(
      'Archive Conversation',
      'Are you sure you want to archive this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          style: 'destructive',
          onPress: () => handleConversationSettingChange('archived', true)
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {conversationId && conversationInfo && (
          <>
            <View style={[styles.section, styles.conversationHeader]}>
              <View style={styles.conversationInfo}>
                <Text style={styles.conversationTitle}>
                  {conversationType === 'group' ? conversationInfo.name : conversationInfo.other_user_name}
                </Text>
                <Text style={styles.conversationType}>
                  {conversationType === 'group' ? 'Group Conversation' : 'Direct Message'}
                </Text>
              </View>
              <Ionicons 
                name={conversationType === 'group' ? 'people' : 'person'} 
                size={32} 
                color={theme.colors.primary} 
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Conversation Settings</Text>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Switch
                  value={conversationSettings.notifications}
                  onValueChange={(value) => handleConversationSettingChange('notifications', value)}
                  disabled={saving}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Sound Alerts</Text>
                <Switch
                  value={conversationSettings.sounds}
                  onValueChange={(value) => handleConversationSettingChange('sounds', value)}
                  disabled={saving || !conversationSettings.notifications}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Vibration</Text>
                <Switch
                  value={conversationSettings.vibration}
                  onValueChange={(value) => handleConversationSettingChange('vibration', value)}
                  disabled={saving || !conversationSettings.notifications}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Message Preview</Text>
                <Switch
                  value={conversationSettings.message_preview}
                  onValueChange={(value) => handleConversationSettingChange('message_preview', value)}
                  disabled={saving}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Read Receipts</Text>
                <Switch
                  value={conversationSettings.read_receipts}
                  onValueChange={(value) => handleConversationSettingChange('read_receipts', value)}
                  disabled={saving}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Typing Indicators</Text>
                <Switch
                  value={conversationSettings.typing_indicators}
                  onValueChange={(value) => handleConversationSettingChange('typing_indicators', value)}
                  disabled={saving}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Auto-download Media</Text>
                <Switch
                  value={conversationSettings.media_auto_download}
                  onValueChange={(value) => handleConversationSettingChange('media_auto_download', value)}
                  disabled={saving}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <List.Item
                title="Mute for 1 hour"
                left={() => <Ionicons name="notifications-off" size={24} color={theme.colors.onSurface} />}
                onPress={() => muteConversation(1)}
                style={styles.actionItem}
              />
              
              <List.Item
                title="Mute for 8 hours"
                left={() => <Ionicons name="notifications-off" size={24} color={theme.colors.onSurface} />}
                onPress={() => muteConversation(8)}
                style={styles.actionItem}
              />
              
              <List.Item
                title="Mute until unmuted"
                left={() => <Ionicons name="notifications-off" size={24} color={theme.colors.onSurface} />}
                onPress={() => muteConversation(24 * 365)}
                style={styles.actionItem}
              />
              
              {conversationSettings.muted && (
                <List.Item
                  title="Unmute"
                  left={() => <Ionicons name="notifications" size={24} color={theme.colors.primary} />}
                  onPress={() => muteConversation(null)}
                  style={styles.actionItem}
                />
              )}
              
              <List.Item
                title="Archive Conversation"
                left={() => <Ionicons name="archive" size={24} color={theme.colors.onSurface} />}
                onPress={archiveConversation}
                style={styles.actionItem}
              />
            </View>

            <Divider style={styles.divider} />
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Settings</Text>
          <Text style={styles.sectionDescription}>
            These settings apply to all new conversations
          </Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Notifications</Text>
            <Switch
              value={globalSettings.default_notifications}
              onValueChange={(value) => handleGlobalSettingChange('default_notifications', value)}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Sound Alerts</Text>
            <Switch
              value={globalSettings.default_sounds}
              onValueChange={(value) => handleGlobalSettingChange('default_sounds', value)}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Vibration</Text>
            <Switch
              value={globalSettings.default_vibration}
              onValueChange={(value) => handleGlobalSettingChange('default_vibration', value)}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Read Receipts</Text>
            <Switch
              value={globalSettings.default_read_receipts}
              onValueChange={(value) => handleGlobalSettingChange('default_read_receipts', value)}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Typing Indicators</Text>
            <Switch
              value={globalSettings.default_typing_indicators}
              onValueChange={(value) => handleGlobalSettingChange('default_typing_indicators', value)}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Auto-download Media</Text>
            <Switch
              value={globalSettings.default_media_auto_download}
              onValueChange={(value) => handleGlobalSettingChange('default_media_auto_download', value)}
              disabled={saving}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Storage</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Backup Messages</Text>
            <Switch
              value={globalSettings.backup_messages}
              onValueChange={(value) => handleGlobalSettingChange('backup_messages', value)}
              disabled={saving}
            />
          </View>

          <List.Item
            title="Clear All Messages"
            description="Remove all message history"
            left={() => <Ionicons name="trash" size={24} color={theme.colors.error} />}
            onPress={() => {
              Alert.alert(
                'Clear All Messages',
                'This will permanently delete all your message history. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear All', style: 'destructive' }
                ]
              );
            }}
            style={[styles.actionItem, { borderColor: theme.colors.error }]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...createBoxShadow(0, 2, 4, 'rgba(0, 0, 0, 0.1)', 2),
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  conversationType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  actionItem: {
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#F8F8F8',
  },
  divider: {
    marginVertical: 16,
  },
});

export default MessagingSettingsScreen;
