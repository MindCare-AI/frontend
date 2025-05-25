/**
 * Debug utilities for the messaging system
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utility functions
 */

/**
 * Debug logging utility that only logs in development mode
 */
export const debugLog = (source: string, ...args: any[]) => {
  if (__DEV__) {
    console.log(source, ...args);
  }
};

/**
 * Debug error logging utility that only logs in development mode
 */
export const debugError = (source: string, ...args: any[]) => {
  if (__DEV__) {
    console.error(source, ...args);
  }
};

/**
 * Log warning messages when in debug mode
 * @param namespace The log namespace/tag
 * @param message The message to log
 * @param data Additional data to log
 */
export function debugWarn(namespace: string, message: string, data?: any): void {
  if (!__DEV__) return;
  
  if (data) {
    console.warn(`${namespace} ${message}`, data);
  } else {
    console.warn(`${namespace} ${message}`);
  }
}

/**
 * Create a namespaced logger
 * @param namespace The namespace for the logger
 */
export function createNamespacedLogger(namespace: string) {
  return {
    log: (message: string, data?: any) => debugLog(namespace, message, data),
    warn: (message: string, data?: any) => debugWarn(namespace, message, data),
    error: (message: string, error?: any) => debugError(namespace, message, error),
  };
}

/**
 * Debug utility to validate a web socket connection
 */
export function validateWebSocketConnection(socketUrl: string): Promise<{ success: boolean, message: string }> {
  return new Promise((resolve) => {
    try {
      debugLog('WebSocket', `Attempting connection to ${socketUrl}`);
      
      const socket = new WebSocket(socketUrl);
      let pingReceived = false;
      let timeoutId = setTimeout(() => {
        debugError('WebSocket', 'Connection timed out');
        socket.close();
        resolve({ success: false, message: 'Connection timed out after 5 seconds' });
      }, 5000);
      
      socket.onopen = () => {
        debugLog('WebSocket', 'Connection opened successfully');
        
        // Try sending a ping
        try {
          socket.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
          debugLog('WebSocket', 'Ping sent');
          
          // Set a timeout to wait for pong response
          setTimeout(() => {
            if (!pingReceived) {
              debugLog('WebSocket', 'No ping response received');
              clearTimeout(timeoutId);
              socket.close();
              resolve({ success: false, message: 'Connection opened but server did not respond to ping' });
            }
          }, 3000);
        } catch (error) {
          clearTimeout(timeoutId);
          debugError('WebSocket', 'Error sending ping', error);
          socket.close();
          resolve({ success: false, message: `Error sending ping: ${error}` });
        }
      };
      
      // Listen for messages to detect ping response
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong' || data.type === 'ping_response') {
            debugLog('WebSocket', 'Received pong from server');
            pingReceived = true;
            clearTimeout(timeoutId);
            socket.close(1000, 'Test complete');
            resolve({ success: true, message: 'Connection successful and server responded to ping' });
          }
        } catch (e) {
          // Ignore parsing errors for non-JSON messages
        }
      };
      
      socket.onclose = (event) => {
        clearTimeout(timeoutId);
        if (event.code !== 1000) {
          debugError('WebSocket', `Connection closed with code ${event.code}: ${event.reason}`);
          resolve({ success: false, message: `Connection closed with code ${event.code}: ${event.reason}` });
        }
      };
      
      socket.onerror = (error) => {
        clearTimeout(timeoutId);
        debugError('WebSocket', 'Connection error', error);
        resolve({ success: false, message: 'Connection error' });
      };
    } catch (error) {
      debugError('WebSocket', 'Failed to create WebSocket', error);
      resolve({ success: false, message: `Failed to create WebSocket: ${error}` });
    }
  });
}

/**
 * Comprehensive diagnostics for messaging system
 * @param conversationId The conversation ID to test
 * @returns Promise with diagnostic results
 */
export async function diagnoseMessagingSystem(conversationId: string | number): Promise<{
  webSocketConnection: boolean;
  restApiAccess: boolean;
  messages: boolean;
  details: string[];
}> {
  const details: string[] = [];
  let wsConnection = false;
  let restApi = false;
  let messagesReceived = false;
  
  // Import dependencies within function to avoid circular references
  const { default: messagingService } = require('../services/messagingService');
  const { API_BASE_URL, WS_BASE_URL } = require('../config');
  
  try {
    details.push('Starting messaging system diagnostics...');
    
    // Step 1: Check auth token
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      details.push('❌ No authentication token found');
      return { webSocketConnection: false, restApiAccess: false, messages: false, details };
    }
    details.push('✅ Authentication token retrieved');
    
    // Step 2: Test WebSocket connection
    const tokenSuffix = `token=${token}`;
    const wsUrl = `${WS_BASE_URL}/ws/conversation/${conversationId}/?${tokenSuffix}`;
    details.push('Testing WebSocket connection...');
    
    const wsResult = await validateWebSocketConnection(wsUrl);
    if (wsResult.success) {
      details.push(`✅ WebSocket: ${wsResult.message}`);
      wsConnection = true;
    } else {
      details.push(`❌ WebSocket: ${wsResult.message}`);
    }
    
    // Step 3: Test REST API by fetching conversations
    details.push('Testing REST API access...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/messaging/conversations/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        details.push(`✅ REST API: Successfully fetched ${data.results?.length || 0} conversations`);
        restApi = true;
      } else {
        details.push(`❌ REST API: Error ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      details.push(`❌ REST API: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Step 4: Test fetching messages
    details.push('Testing message retrieval...');
    try {
      const messages = await messagingService.getMessages(conversationId.toString());
      details.push(`✅ Messages: Successfully fetched ${messages.length} messages`);
      messagesReceived = messages.length > 0;
    } catch (error) {
      details.push(`❌ Messages: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      webSocketConnection: wsConnection,
      restApiAccess: restApi, 
      messages: messagesReceived,
      details
    };
  } catch (error) {
    details.push(`❌ Diagnostic error: ${error instanceof Error ? error.message : String(error)}`);
    return { 
      webSocketConnection: wsConnection, 
      restApiAccess: restApi, 
      messages: messagesReceived, 
      details 
    };
  }
}
