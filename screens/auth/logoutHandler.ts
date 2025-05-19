import { CommonActions } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../../config";
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function handleLogout(navigation: any, signOut: () => Promise<void>) {
  try {
    // Get current tokens
    const [accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem('accessToken'),
      AsyncStorage.getItem('refreshToken')
    ]);

    if (accessToken) {
      // Call backend logout endpoint to blacklist tokens
      try {
        await axios.post(`${API_URL}/auth/logout/`, {
          refresh: refreshToken
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      } catch (logoutError) {
        // Continue with local cleanup even if server logout fails
        console.warn('Server logout failed:', logoutError);
      }
    }

    // Clear all auth-related storage
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'userData',
      'oauth_state'
    ]);

    // Use the passed signOut function from the auth context
    await signOut();

    // Reset navigation to login screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Auth", params: { screen: "Login" } }],
      })
    );
  } catch (error) {
    console.error("Logout error:", error);
    
    // If error occurs, still try to force navigation to login
    navigation.navigate("Auth", { screen: "Login" });
  }
}
