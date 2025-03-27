import { WS_BASE_URL } from '../config';

export const setupWebSocket = (conversationId: string) => {
  const ws = new WebSocket(`${WS_BASE_URL}/ws/chat/${conversationId}/`);
  
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    // Handle updates: messages, typing indicators, reactions
  };
  
  return ws;
};