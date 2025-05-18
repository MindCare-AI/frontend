// utils/errorHandler.ts
import axios from 'axios';

// Create type for axios error handling
interface AxiosErrorResponse {
  data: any;
  status: number;
  headers?: any;
}

interface AxiosErrorType extends Error {
  isAxiosError: boolean;
  response?: AxiosErrorResponse;
  request?: any;
  config?: any;
}

export type APIErrorResponse = {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Check if it's an Axios error
    if ('isAxiosError' in error && (error as AxiosErrorType).isAxiosError) {
      const axiosError = error as AxiosErrorType;
      const apiError = axiosError.response?.data as APIErrorResponse;

      if (apiError?.detail) {
        return apiError.detail;
      } 
      
      if (apiError?.message) {
        return apiError.message;
      }
      
      if (apiError?.errors) {
        const errorMessages = Object.entries(apiError.errors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('; ');
        
        return errorMessages || 'An error occurred with your request';
      }
      
      if (error.message) {
        return `Network error: ${error.message}`;
      }
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Format error for display
export const formatError = (error: unknown): { message: string; title: string } => {
  const message = getErrorMessage(error);
  let title = 'Error';
  
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosErrorType;
    
    if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
      title = 'Authentication Error';
    } else if (axiosError.response?.status === 404) {
      title = 'Not Found';
    } else if (axiosError.response?.status === 422 || axiosError.response?.status === 400) {
      title = 'Validation Error';
    } else if (axiosError.response?.status && axiosError.response?.status >= 500) {
      title = 'Server Error';
    }
  }
  
  return { message, title };
};

interface FormattedError {
  message: string;
  code?: string;
  status?: number;
}

type ErrorCallback = (error: FormattedError) => void;
type SimpleErrorCallback = (error: { message: string; title: string }) => void;

// Handle error with optional callback - simple version
export const handleSimpleError = (
  error: unknown, 
  callback?: SimpleErrorCallback
): { message: string; title: string } => {
  const formattedError = formatError(error);
  
  if (callback) {
    callback(formattedError);
  }
  
  console.error(`${formattedError.title}: ${formattedError.message}`);
  
  return formattedError;
};

/**
 * Handles API errors and formats them for consistent use across the app
 * @param error The error object to handle
 * @param callback Optional callback to execute with the formatted error
 * @returns Formatted error object
 */
export function handleError(error: unknown, callback?: ErrorCallback): FormattedError {
  let formattedError: FormattedError = {
    message: 'An unexpected error occurred',
  };

  if (error) {
    // Check if it's an axios error
    const isAxiosError = error instanceof Error && 'isAxiosError' in error;
    
    if (isAxiosError) {
      const axiosError = error as AxiosErrorType;
      
      if (axiosError.response) {
        const { data, status } = axiosError.response;

        formattedError.status = status;

        if (typeof data === 'string') {
          formattedError.message = data;
        } else if (data?.error) {
          formattedError.message = data.error;
          formattedError.code = data.code;
        } else if (data?.message) {
          formattedError.message = data.message;
          formattedError.code = data.code;
        } else if (data?.detail) {
          formattedError.message = data.detail;
        } else if (Array.isArray(data)) {
          formattedError.message = data.join(', ');
        }

        // Handle common HTTP status codes
        if (status === 401) {
          formattedError.message = 'Please log in again to continue';
          formattedError.code = 'auth/session-expired';
        } else if (status === 403) {
          formattedError.message = 'You don\'t have permission to access this resource';
          formattedError.code = 'auth/forbidden';
        } else if (status === 404) {
          formattedError.message = 'The requested resource was not found';
          formattedError.code = 'resource/not-found';
        } else if (status >= 500) {
          formattedError.message = 'Server error. Please try again later.';
          formattedError.code = 'server/error';
        }
      } else if (axiosError.request) {
        // Request was made but no response was received
        formattedError.message = 'No response from server. Please check your internet connection.';
        formattedError.code = 'network/no-response';
      }
    } else if (error instanceof Error) {
      // Error with request setup
      formattedError.message = error.message;
    } else if (typeof error === 'string') {
      formattedError.message = error;
    }
  }

  // Execute callback if provided
  if (callback) {
    callback(formattedError);
  }

  return formattedError;
}