"use client"

import React, { useState } from "react"
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Image,
  Platform,
  StatusBar,
  ActivityIndicator
} from "react-native"
import { VideoView, useVideoPlayer } from "expo-video"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/feeds/ThemeContext"

interface MediaViewerModalProps {
  visible: boolean
  onClose: () => void
  mediaUrl: string
  mediaType: "image" | "video"
  title?: string
}

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  visible,
  onClose,
  mediaUrl,
  mediaType,
  title
}) => {
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const windowDimensions = Dimensions.get("window")
  
  // Video player for videos
  const videoPlayer = useVideoPlayer(mediaType === "video" ? mediaUrl : "", (player) => {
    player.loop = false
    player.muted = false
    player.play()
  })

  // Handle video loading state
  React.useEffect(() => {
    if (mediaType === "video" && videoPlayer && visible) {
      // Set loading to false after a brief delay to allow video to initialize
      const timer = setTimeout(() => {
        setLoading(false)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [mediaType, videoPlayer, visible])

  const handleImageLoad = () => {
    setImageLoaded(true)
    setLoading(false)
  }

  const handleImageError = () => {
    setLoading(false)
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        {/* Media Content */}
        <View style={styles.mediaContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          {mediaType === "image" ? (
            <Image
              source={{ uri: mediaUrl }}
              style={[
                styles.fullScreenImage,
                {
                  width: windowDimensions.width,
                  height: windowDimensions.height,
                  opacity: imageLoaded ? 1 : 0
                }
              ]}
              resizeMode="contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <VideoView
              player={videoPlayer}
              style={[
                styles.fullScreenVideo,
                {
                  width: windowDimensions.width,
                  height: windowDimensions.height,
                }
              ]}
              allowsFullscreen
              nativeControls
            />
          )}
        </View>

        {/* Bottom controls for images */}
        {mediaType === "image" && (
          <View style={[styles.bottomControls, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0 + 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 1000,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  title: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 16,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: {
    color: "white",
    marginTop: 12,
    fontSize: 16,
  },
  fullScreenImage: {
    flex: 1,
  },
  fullScreenVideo: {
    flex: 1,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 32,
  },
  controlButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
})

export default MediaViewerModal
