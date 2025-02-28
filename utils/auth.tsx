import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};