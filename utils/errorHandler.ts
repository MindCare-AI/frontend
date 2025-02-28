//utils/errorHandler.ts
export const handleAPIError = (error: any) => {
    console.error('API Error:', error);
    return error.response?.data?.detail || 'An unexpected error occurred';
  };
  
  // Use in API calls:
  try {
    // ... API call
  } catch (error) {
    setLoginError(handleAPIError(error));
  }
function setLoginError(errorMessage: string) {
    // Assuming there's a state or a way to display the error message to the user
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
        errorElement.textContent = errorMessage;
    } else {
        console.error('Login error element not found');
    }
}
