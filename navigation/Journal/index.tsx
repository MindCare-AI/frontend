import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import JournalDashboard from "../../screens/Journal/JournalDashboard"
import { JournalProvider } from "../../contexts/Journal/JournalContext"

export type RootStackParamList = {
  JournalDashboard: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function JournalNavigator() {
  return (
    <JournalProvider>
      <Stack.Navigator
        initialRouteName="JournalDashboard"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="JournalDashboard" component={JournalDashboard} />
      </Stack.Navigator>
    </JournalProvider>
  )
}
