// Add to a new file: API/utils/apiErrors.ts
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export function parseApiError(error: any): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    
    return {
      status,
      message: typeof data === 'string' ? data : data.message || 'An error occurred',
      errors: data.errors || undefined
    };
  }
  
  return {
    status: 0,
    message: error.message || 'Network error occurred'
  };
}