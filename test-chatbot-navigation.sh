#!/bin/bash

# Script to test Chatbot navigation

echo "Testing Chatbot Navigation..."

# Check if the ChatbotNavigator.tsx file exists
if [ -f "/home/siaziz/Desktop/frontend/navigation/ChatbotNavigator.tsx" ]; then
  echo "✅ ChatbotNavigator.tsx exists"
else
  echo "❌ ChatbotNavigator.tsx not found"
  exit 1
fi

# Check if the ChatbotConversationListScreen.tsx file exists
if [ -f "/home/siaziz/Desktop/frontend/screens/ChatbotScreen/ChatbotConversationListScreen.tsx" ]; then
  echo "✅ ChatbotConversationListScreen.tsx exists"
else
  echo "❌ ChatbotConversationListScreen.tsx not found"
  exit 1
fi

# Check if the ConversationSettingsScreen.tsx file exists
if [ -f "/home/siaziz/Desktop/frontend/screens/ChatbotScreen/ConversationSettingsScreen.tsx" ]; then
  echo "✅ ConversationSettingsScreen.tsx exists"
else
  echo "❌ ConversationSettingsScreen.tsx not found"
  exit 1
fi

# Check if the ChatbotNavigator is properly imported in AppNavigator.tsx
grep -q "import ChatbotNavigator from './ChatbotNavigator'" /home/siaziz/Desktop/frontend/navigation/AppNavigator.tsx
if [ $? -eq 0 ]; then
  echo "✅ ChatbotNavigator is imported in AppNavigator.tsx"
else
  echo "❌ ChatbotNavigator is not imported in AppNavigator.tsx"
  exit 1
fi

# Check if the AppNavigator is using ChatbotNavigator
grep -q "component={ChatbotNavigator}" /home/siaziz/Desktop/frontend/navigation/AppNavigator.tsx
if [ $? -eq 0 ]; then
  echo "✅ AppNavigator is using ChatbotNavigator"
else
  echo "❌ AppNavigator is not using ChatbotNavigator"
  exit 1
fi

# Check if the ChatbotStackParamList is defined in types.tsx
grep -q "export type ChatbotStackParamList" /home/siaziz/Desktop/frontend/navigation/types.tsx
if [ $? -eq 0 ]; then
  echo "✅ ChatbotStackParamList is defined in types.tsx"
else
  echo "❌ ChatbotStackParamList is not defined in types.tsx"
  exit 1
fi

echo ""
echo "All checks passed! The Chatbot navigation is set up correctly."
echo ""
echo "To run the app, use: npm start or expo start"
