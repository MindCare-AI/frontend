//utils/styles.ts
import { Platform } from 'react-native';

export const getShadowStyles = (elevation = 5) => {
  return Platform.select({
    web: {
      boxShadow: `0px 2px ${elevation}px rgba(0, 0, 0, 0.15)`,
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: elevation,
      elevation: elevation,
    },
  });
};