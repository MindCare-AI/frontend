import { Box, Text, Heading, VStack, Avatar, Divider } from "native-base"
import Header from "../../../components/Appointments/patient_dashboard/Header"
import { AZIZ_BAHLOUL } from "../../../data/tunisianMockData"

const ProfileScreen = () => {
  const patientData = AZIZ_BAHLOUL;

  return (
    <Box flex={1} bg="secondary.50" safeArea>
      <Header />

      <Box flex={1} p={4}>
        <VStack space={6} alignItems="center" mt={6}>
          <Avatar
            size="xl"
            source={{
              uri: patientData.profile_pic,
            }}
            borderWidth={2}
            borderColor="primary.500"
          />

          <Heading size="lg">{patientData.full_name}</Heading>
          <Text color="gray.500">Patient ID: {patientData.id}</Text>

          <Divider my={2} />

          <VStack width="100%" space={4}>
            <Box bg="white" p={4} rounded="md" shadow={1}>
              <Heading size="sm" mb={2}>
                Personal Information
              </Heading>
              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Email</Text>
                  <Text>{patientData.email}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Phone</Text>
                  <Text>{patientData.phone_number}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Date of Birth</Text>
                  <Text>{new Date(patientData.date_of_birth).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Gender</Text>
                  <Text>{patientData.gender === 'M' ? 'Male' : patientData.gender === 'F' ? 'Female' : 'Other'}</Text>
                </HStack>
              </VStack>
            </Box>

            <Box bg="white" p={4} rounded="md" shadow={1}>
              <Heading size="sm" mb={2}>
                Address Information
              </Heading>
              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Street</Text>
                  <Text flex={1} textAlign="right">{patientData.address.street}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">City</Text>
                  <Text>{patientData.address.city}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">State</Text>
                  <Text flex={1} textAlign="right">{patientData.address.state}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Country</Text>
                  <Text>{patientData.address.country}</Text>
                </HStack>
              </VStack>
            </Box>

            <Box bg="white" p={4} rounded="md" shadow={1}>
              <Heading size="sm" mb={2}>
                Medical Information
              </Heading>
              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Blood Type</Text>
                  <Text>{patientData.blood_type}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Medical History</Text>
                  <Text flex={1} textAlign="right">
                    {patientData.medical_history.map(h => h.condition).join(', ')}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Emergency Contact</Text>
                  <Text flex={1} textAlign="right">{patientData.emergency_contact.name}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Emergency Phone</Text>
                  <Text>{patientData.emergency_contact.phone}</Text>
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
