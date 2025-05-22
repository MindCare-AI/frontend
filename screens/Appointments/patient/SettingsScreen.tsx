import { Box, Text, Heading, VStack, Switch, HStack, Divider, Icon, Pressable } from "native-base"
import { Ionicons } from "@expo/vector-icons"
import Header from "../../../components/Appointments/patient_dashboard/Header"

const SettingsScreen = () => {
  return (
    <Box flex={1} bg="secondary.50" safeArea>
      <Header />

      <Box flex={1} p={4}>
        <VStack space={6}>
          <Heading size="lg">Settings</Heading>

          <Box bg="white" p={4} rounded="md" shadow={1}>
            <Heading size="sm" mb={4}>
              Notifications
            </Heading>
            <VStack space={4} divider={<Divider />}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text>Appointment Reminders</Text>
                <Switch colorScheme="primary" defaultIsChecked />
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text>Waiting List Updates</Text>
                <Switch colorScheme="primary" defaultIsChecked />
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text>Email Notifications</Text>
                <Switch colorScheme="primary" defaultIsChecked />
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text>SMS Notifications</Text>
                <Switch colorScheme="primary" />
              </HStack>
            </VStack>
          </Box>

          <Box bg="white" p={4} rounded="md" shadow={1}>
            <Heading size="sm" mb={4}>
              Account
            </Heading>
            <VStack space={4} divider={<Divider />}>
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text>Change Password</Text>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
                </HStack>
              </Pressable>

              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text>Update Contact Information</Text>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
                </HStack>
              </Pressable>

              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text>Privacy Settings</Text>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
                </HStack>
              </Pressable>
            </VStack>
          </Box>

          <Box bg="white" p={4} rounded="md" shadow={1}>
            <Heading size="sm" mb={4}>
              Support
            </Heading>
            <VStack space={4} divider={<Divider />}>
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text>Help Center</Text>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
                </HStack>
              </Pressable>

              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text>Contact Support</Text>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
                </HStack>
              </Pressable>

              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text>Terms of Service</Text>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
                </HStack>
              </Pressable>

              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text>Privacy Policy</Text>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
                </HStack>
              </Pressable>
            </VStack>
          </Box>

          <Pressable>
            <Box bg="red.500" p={4} rounded="md" shadow={1}>
              <Text color="white" textAlign="center" fontWeight="bold">
                Sign Out
              </Text>
            </Box>
          </Pressable>
        </VStack>
      </Box>
    </Box>
  )
}

export default SettingsScreen
