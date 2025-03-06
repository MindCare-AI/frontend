import React, { useEffect } from 'react';
import { Linking, View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../types/navigation';
import { API_BASE_URL } from '../../config';
import { OAUTH_CONFIG } from '../../config/oauth';

const GoogleCallbackScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (url.includes('oauth_callback')) {
        try {
          // Parse callback parameters
          const params = new URLSearchParams(url.split('?')[1]);
          const code = params.get('code');
          const state = params.get('state');
          const storedState = await AsyncStorage.getItem('oauth_state');
          const error = params.get('error');

          // Check for OAuth errors
          if (error) {
            throw new Error(`OAuth error: ${error}`);
          }

          // Validate parameters
          if (!code || !state) {
            throw new Error('Missing required OAuth parameters');
          }

          // Verify state to prevent CSRF
          if (state !== storedState) {
            throw new Error('Invalid state parameter');
          }

          // Exchange code for tokens
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/google/callback/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ 
              code,
              state,
              redirect_uri: OAUTH_CONFIG.googleAuth.redirectUri
            })
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Authentication failed');
          }

          const data = await response.json();

          // Store tokens securely
          await AsyncStorage.multiSet([
            ['accessToken', data.access],
            ['refreshToken', data.refresh]
          ]);

          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'App',
              params: { screen: 'Welcome' }
            }]
          });
        } catch (error) {
          console.error('OAuth callback error:', error);
          Alert.alert(
            'Authentication Error',
            'Failed to complete authentication. Please try again.'
          );
          navigation.navigate('Auth', { screen: 'Login' });
        } finally {
          await AsyncStorage.removeItem('oauth_state');
        }
      }
    };

    Linking.addEventListener('url', handleDeepLink);
    return () => Linking.removeAllListeners('url');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#002D62" />
      <Text style={styles.text}>Completing Google Sign In...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E4F0F6',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#002D62',
  },
});

export default GoogleCallbackScreen;