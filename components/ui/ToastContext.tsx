//components/ui/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast } from './Toast';

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
  action?: {
    label: string;
    onPress: () => void;
  };
};

type ToastContextType = {
  toast: (props: Omit<ToastProps, 'id'>) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(({ duration = 5000, ...props }: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((current) => [...current, { id, duration, ...props }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <View 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0,
          pointerEvents: 'box-none' // Put it in style object
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={() => toast.id && dismiss(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 999,
    alignItems: 'center',
    paddingTop: 50, // Adjust based on your needs
    pointerEvents: 'box-none',
  },
});

export default ToastProvider;