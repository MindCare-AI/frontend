// API/waitingList.ts - All Waiting List APIs
import axios from 'axios';
import { API_URL } from '../../config';
import { getAuthToken } from '../../lib/utils';
import { 
  WaitingListEntry, 
  PaginatedResponse,
  CreateWaitingListParams
} from './types';

/**
 * Format query parameters for API calls
 */
const formatQueryParams = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  return queryParams.toString() ? `?${queryParams.toString()}` : '';
};

/**
 * Get all waiting list entries
 * @param filters Optional filter parameters
 * @returns Promise with paginated waiting list entries
 */
export const getWaitingList = async (
  filters?: Record<string, any>
): Promise<PaginatedResponse<WaitingListEntry>> => {
  try {
    const token = await getAuthToken();
    const queryString = filters ? formatQueryParams(filters) : '';
    
    const response = await axios.get(`${API_URL}/appointments/waiting-list/${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data as PaginatedResponse<WaitingListEntry>;
  } catch (error) {
    console.error('Error fetching waiting list:', error);
    throw error;
  }
};

/**
 * Get a specific waiting list entry
 * @param id The entry ID
 * @returns Promise with waiting list entry
 */
export const getWaitingListEntry = async (id: number): Promise<WaitingListEntry> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.get(`${API_URL}/appointments/waiting-list/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data as WaitingListEntry;
  } catch (error) {
    console.error(`Error fetching waiting list entry ${id}:`, error);
    throw error;
  }
};

/**
 * Join the waiting list
 * @param entryData Waiting list entry data
 * @returns Promise with created waiting list entry
 */
export const joinWaitingList = async (
  entryData: CreateWaitingListParams
): Promise<WaitingListEntry> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(`${API_URL}/appointments/waiting-list/`, entryData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as WaitingListEntry;
  } catch (error) {
    console.error('Error joining waiting list:', error);
    throw error;
  }
};

/**
 * Update a waiting list entry
 * @param id The entry ID
 * @param entryData The data to update
 * @returns Promise with updated entry
 */
export const updateWaitingListEntry = async (
  id: number, 
  entryData: Partial<WaitingListEntry>
): Promise<WaitingListEntry> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.patch(`${API_URL}/appointments/waiting-list/${id}/`, entryData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as WaitingListEntry;
  } catch (error) {
    console.error(`Error updating waiting list entry ${id}:`, error);
    throw error;
  }
};

/**
 * Remove from waiting list
 * @param id The entry ID
 * @returns Promise with deletion status
 */
export const removeFromWaitingList = async (id: number): Promise<void> => {
  try {
    const token = await getAuthToken();
    
    await axios.delete(`${API_URL}/appointments/waiting-list/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  } catch (error) {
    console.error(`Error removing from waiting list ${id}:`, error);
    throw error;
  }
};

/**
 * Cancel waiting list entry
 * @param id The entry ID
 * @returns Promise with updated entry
 */
export const cancelWaitingListEntry = async (id: number): Promise<WaitingListEntry> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.post(`${API_URL}/appointments/waiting-list/${id}/cancel/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data as WaitingListEntry;
  } catch (error) {
    console.error(`Error cancelling waiting list entry ${id}:`, error);
    throw error;
  }
};

/**
 * Check for available slots matching waiting list entries
 * @returns Promise with available slots that match waiting list criteria
 */
export const checkWaitingListAvailability = async (): Promise<any> => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.get(`${API_URL}/appointments/waiting-list/check-availability/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error checking waiting list availability:', error);
    throw error;
  }
};