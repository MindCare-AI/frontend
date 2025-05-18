//types/react-native-community__netinfo.d.ts
declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    type: string;
    isConnected: boolean;
    isInternetReachable: boolean | null;
    details: any;
  }

  type NetInfoSubscription = () => void;
  
  export interface NetInfo {
    addEventListener(listener: (state: NetInfoState) => void): NetInfoSubscription;
    fetch(): Promise<NetInfoState>;
  }

  const NetInfo: NetInfo;
  export default NetInfo;
  
  // Add useNetInfo hook
  export function useNetInfo(): NetInfoState;
}