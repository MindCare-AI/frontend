import { StyleSheet } from 'react-native';

// Native styles
const nativeStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  input: {
    width: '80%',
    padding: 12,
    marginVertical: 8,
    borderBottomWidth: 1,
  },
  button: {
    width: '80%',
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export const getShadowStyles = (elevation: number) => {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: 0.3,
    shadowRadius: elevation,
    elevation,
  };
};

// Combined styles object
export const globalStyles = {
  ...nativeStyleSheet,
  
  // Web-specific styles
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  
  '.animate-fade-in': {
    animation: 'fadeIn 0.3s ease-out forwards'
  },
  
  '.post-card': {
    transition: 'all 0.2s ease-out',
    '&:hover': {
      transform: 'translateY(-2px)'
    }
  },
  
  '.post-reaction-button': {
    transition: 'all 0.15s ease-out',
    '&.active': {
      fontWeight: 500
    }
  }
};
