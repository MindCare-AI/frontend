"use client"

import { useState, useEffect } from "react"
import NetInfo from "@react-native-community/netinfo"

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null)
  const [connectionType, setConnectionType] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected)
      setIsInternetReachable(state.isInternetReachable)
      setConnectionType(state.type)
    })

    return () => unsubscribe()
  }, [])

  return {
    isConnected,
    isInternetReachable,
    connectionType,
    isOffline: isConnected === false,
  }
}
