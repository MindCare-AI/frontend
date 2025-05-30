import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Use a fallback if useWebSocket is missing
// @ts-ignore
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../contexts/AuthContext';

interface UserPresenceProps {
  userId: number | string;
}

export const UserPresence: React.FC<UserPresenceProps> = ({ userId }) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const { user } = useAuth();
  
  // Use our WebSocket hook to connect to the presence WebSocket
  const { lastMessage, error, state } = useWebSocket('/ws/presence/', {
    onOpen: () => {
      console.log('Presence WebSocket connected!');
    },
    onMessage: (data: any) => {
      if (data.type === 'presence_update' && data.user_id === userId) {
        setIsOnline(data.status === 'online');
      }
    },
    onError: (err: any) => {
      console.error('Presence WebSocket error:', err);
    },
    onClose: (event: any) => {
      console.log('Presence WebSocket closed:', event.code, event.reason);
    }
  });

  useEffect(() => {
    // Update UI based on WebSocket state
    if (state === 'OPEN') {
      console.log('WebSocket connection is active');
    } else if (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [state, error]);

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, isOnline ? styles.online : styles.offline]} />
      <Text style={styles.status}>{isOnline ? 'Online' : 'Offline'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#9e9e9e',
  },
  status: {
    fontSize: 12,
    color: '#666666',
  },
});