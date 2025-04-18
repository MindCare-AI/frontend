import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

interface VoiceMessageProps {
  uri?: string;
  isRecording?: boolean;
  duration?: number;
  onRecordingComplete?: (uri: string) => void;
  onPlaybackComplete?: () => void;
}

const formatDuration = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const VoiceMessage: React.FC<VoiceMessageProps> = ({
  uri,
  isRecording,
  duration = 0,
  onRecordingComplete,
  onPlaybackComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [soundDuration, setSoundDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const animationRef = useRef<Animated.Value>(new Animated.Value(1));

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      if (uri && onRecordingComplete) {
        onRecordingComplete(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }

    recordingRef.current = null;
  };

  const loadSound = async () => {
    if (!uri) return;

    try {
      setIsLoading(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = sound;
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setSoundDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Failed to load sound:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      if (status.didJustFinish) {
        setIsPlaying(false);
        onPlaybackComplete?.();
      }
    }
  };

  const togglePlayback = async () => {
    if (!soundRef.current) {
      await loadSound();
    }

    try {
      if (isPlaying) {
        await soundRef.current?.pauseAsync();
      } else {
        await soundRef.current?.playFromPositionAsync(playbackPosition);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const progress = soundDuration ? playbackPosition / soundDuration : 0;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress * 100}%`,
  }));

  const recordingAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.2, { duration: 500 }),
            withTiming(1, { duration: 500 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      {isRecording ? (
        <Animated.View style={[styles.recordingContainer, recordingAnimStyle]}>
          <Icon name="radio" size={24} color="#FF3B30" />
          <Text style={styles.recordingTime}>
            {formatDuration(duration)}
          </Text>
        </Animated.View>
      ) : uri ? (
        <TouchableOpacity
          style={styles.playbackContainer}
          onPress={togglePlayback}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <>
              <Icon
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color="#007AFF"
              />
              <View style={styles.progressContainer}>
                <Animated.View
                  style={[styles.progressBar, progressStyle]}
                />
              </View>
              <Text style={styles.duration}>
                {formatDuration(playbackPosition)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    justifyContent: 'center',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 24,
  },
  recordingTime: {
    marginLeft: 8,
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 24,
    minWidth: 120,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  duration: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
});

export default VoiceMessage;