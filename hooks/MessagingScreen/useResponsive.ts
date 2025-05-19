"use client"

import { useState, useEffect } from "react"
import { Dimensions, type ScaledSize } from "react-native"

export function useResponsive() {
  const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get("window"))

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window)
    })

    return () => subscription.remove()
  }, [])

  return {
    width: dimensions.width,
    height: dimensions.height,
    isSmallScreen: dimensions.width < 640,
    isMediumScreen: dimensions.width >= 640 && dimensions.width < 1024,
    isLargeScreen: dimensions.width >= 1024,
    isLandscape: dimensions.width > dimensions.height,
  }
}
