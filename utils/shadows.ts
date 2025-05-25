import { Platform } from 'react-native';

export const createBoxShadow = (
  offsetX: number = 0,
  offsetY: number = 2,
  blurRadius: number = 4,
  color: string = 'rgba(0, 0, 0, 0.1)',
  elevation: number = 2
) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px ${color}`,
    };
  }
  
  // For React Native (iOS/Android), keep using the shadow properties
  return {
    shadowColor: color.replace(/rgba?\(([^)]+)\)/, '$1').split(',')[0] || '#000',
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: parseFloat(color.match(/[\d.]+(?=\))/)?.[0] || '0.1'),
    shadowRadius: blurRadius / 2,
    elevation,
  };
};

export const createElevatedShadow = (elevation: number = 2) => {
  const shadows = {
    1: { offsetY: 1, blurRadius: 3, opacity: 0.12 },
    2: { offsetY: 1, blurRadius: 2, opacity: 0.14 },
    3: { offsetY: 1, blurRadius: 3, opacity: 0.16 },
    4: { offsetY: 2, blurRadius: 4, opacity: 0.18 },
    5: { offsetY: 3, blurRadius: 5, opacity: 0.20 },
    6: { offsetY: 3, blurRadius: 6, opacity: 0.22 },
    8: { offsetY: 5, blurRadius: 8, opacity: 0.24 },
    12: { offsetY: 7, blurRadius: 12, opacity: 0.26 },
    16: { offsetY: 9, blurRadius: 16, opacity: 0.28 },
    24: { offsetY: 11, blurRadius: 24, opacity: 0.30 },
  };

  const shadow = shadows[elevation as keyof typeof shadows] || shadows[2];
  
  return createBoxShadow(
    0,
    shadow.offsetY,
    shadow.blurRadius,
    `rgba(0, 0, 0, ${shadow.opacity})`,
    elevation
  );
};

// Card shadow utility
export const createCardShadow = () => createElevatedShadow(2);

// Button shadow utility
export const createButtonShadow = () => createElevatedShadow(3);

// Modal shadow utility
export const createModalShadow = () => createElevatedShadow(8);

// Header shadow utility
export const createHeaderShadow = () => createBoxShadow(0, 2, 4, 'rgba(0, 0, 0, 0.1)', 2);
