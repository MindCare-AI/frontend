import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const setCachedToken = (token: string) => {
  // Example implementation: Store token in AsyncStorage
  console.log(`Token cached: ${token}`);
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    // Use consistent token key
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      console.warn("Auth token not found");
    }
    return token;
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};
