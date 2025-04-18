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
    useNetInfo(): NetInfoState;
  }

  const NetInfo: NetInfo;
  export default NetInfo;
}