//types/react-native-community__netinfo.d.ts
declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    type: string;
    isConnected: boolean;
    isInternetReachable: boolean | null;
    details: any;
  }

  export function useNetInfo(): NetInfoState;
  export default {
    useNetInfo
  };
}