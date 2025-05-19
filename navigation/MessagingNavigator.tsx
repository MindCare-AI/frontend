import type React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import type { MessagingStackParamList } from "./types"

// Import screens
import HomeScreen from "../screens/MessagingScreen/HomeScreen"
import ChatScreen from "../screens/MessagingScreen/ChatScreen"
import ProfileScreen from "../screens/MessagingScreen/ProfileScreen"
import NewConversationScreen from "../screens/MessagingScreen/NewConversationScreen"
import NewGroupScreen from "../screens/MessagingScreen/NewGroupScreen"
import SearchScreen from "../screens/MessagingScreen/SearchScreen"
import MediaGalleryScreen from "../screens/MessagingScreen/MediaGalleryScreen"
import GroupMembersScreen from "../screens/MessagingScreen/GroupMembersScreen"
import SettingsScreen from "../screens/MessagingScreen/SettingsScreen"
import NotificationSettingsScreen from "../screens/MessagingScreen/NotificationSettingsScreen"

const Stack = createStackNavigator<MessagingStackParamList>()

export const MessagingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="NewConversation" component={NewConversationScreen} />
      <Stack.Screen name="NewGroup" component={NewGroupScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MediaGallery" component={MediaGalleryScreen} />
      <Stack.Screen name="GroupMembers" component={GroupMembersScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </Stack.Navigator>
  )
}

export default MessagingNavigator
