import { Box, Text, Heading, VStack, Avatar, Divider } from "native-base"
import Header from "../../../components/Appointments/patient_dashboard/Header"

const ProfileScreen = () => {
  return (
    <Box flex={1} bg="secondary.50" safeArea>
      <Header />

      <Box flex={1} p={4}>
        <VStack space={6} alignItems="center" mt={6}>
          <Avatar
            size="xl"
            source={{
              uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
            }}
            borderWidth={2}
            borderColor="primary.500"
          />

          <Heading size="lg">Jane Doe</Heading>
          <Text color="gray.500">Patient ID: 12345678</Text>

          <Divider my={2} />

          <VStack width="100%" space={4}>
            <Box bg="white" p={4} rounded="md" shadow={1}>
              <Heading size="sm" mb={2}>
                Personal Information
              </Heading>
              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Email</Text>
                  <Text>jane.doe@example.com</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Phone</Text>
                  <Text>(123) 456-7890</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Date of Birth</Text>
                  <Text>January 1, 1990</Text>
                </HStack>
              </VStack>
            </Box>

            <Box bg="white" p={4} rounded="md" shadow={1}>
              <Heading size="sm" mb={2}>
                Medical Information
              </Heading>
              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Primary Care</Text>
                  <Text>Dr. John Smith</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Insurance</Text>
                  <Text>BlueCross #987654321</Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}

type HStackProps = {
  children: React.ReactNode
  [key: string]: any
}

const HStack: React.FC<HStackProps> = ({ children, ...props }) => {
  return (
    <Box flexDirection="row" {...props}>
      {children}
    </Box>
  )
}

export default ProfileScreen
