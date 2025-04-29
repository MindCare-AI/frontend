import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Alert } from 'react-native';
import { shareJournalEntry } from '../../API/journal';
import { JournalEntry } from '../../types/journal';

interface ShareButtonProps {
  entry: JournalEntry;
  onShareSuccess?: () => void;
  style?: any;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  entry,
  onShareSuccess,
  style
}) => {
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const handleShare = async () => {
    if (entry.shared_with_therapist) {
      Alert.alert(
        'Already Shared',
        'This journal entry has already been shared with your therapist.'
      );
      return;
    }

    try {
      setIsSharing(true);
      
      await shareJournalEntry(entry.id);
      
      Alert.alert(
        'Successfully Shared',
        'Your journal entry has been shared with your therapist and posted to your feed.'
      );
      
      if (onShareSuccess) {
        onShareSuccess();
      }
    } catch (error) {
      console.error('Error sharing journal entry:', error);
      Alert.alert(
        'Sharing Failed',
        'There was a problem sharing your journal entry. Please try again later.'
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button,
        entry.shared_with_therapist ? styles.sharedButton : styles.unsharedButton,
        style
      ]}
      onPress={handleShare}
      disabled={isSharing || entry.shared_with_therapist}
    >
      {isSharing ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>
            {entry.shared_with_therapist ? 'Shared with Therapist' : 'Share with Therapist'}
          </Text>
          {entry.shared_with_therapist && (
            <Text style={styles.sharedIcon}>✓</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  unsharedButton: {
    backgroundColor: '#1976d2',
  },
  sharedButton: {
    backgroundColor: '#4caf50',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  sharedIcon: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4,
  },
});

export default ShareButton;