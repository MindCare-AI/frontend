import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';

interface UseVoiceRecordingOptions {
  onRecordingComplete?: (uri: string) => void;
  onError?: (error: Error) => void;
}

interface RecordingState {
  isRecording: boolean;
  isDurationExceeded: boolean;
  duration: number;
  uri?: string;
}

const MAX_DURATION = 120; // 2 minutes in seconds

export const useVoiceRecording = ({
  onRecordingComplete,
  onError,
}: UseVoiceRecordingOptions) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isDurationExceeded: false,
    duration: 0,
  });
  const [hasPermission, setHasPermission] = useState(false);
  const [durationInterval, setDurationInterval] = useState<NodeJS.Timeout>();

  useEffect(() => {
    checkPermissions();
    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
      stopRecording();
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      setHasPermission(status === 'granted');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      if (!hasPermission) {
        throw new Error('No recording permissions');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        ...Platform.select({
          ios: {
            interruptionModeIOS: 2, // Audio.INTERRUPTION_MODE_MIX_WITH_OTHERS
          },
          android: {
            interruptionModeAndroid: 1, // Audio.INTERRUPTION_MODE_DUCK_OTHERS
          },
        }),
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setRecordingState({
        isRecording: true,
        isDurationExceeded: false,
        duration: 0,
      });

      // Start duration tracking
      const interval = setInterval(() => {
        setRecordingState(prev => {
          const newDuration = prev.duration + 1;
          const isDurationExceeded = newDuration >= MAX_DURATION;

          if (isDurationExceeded) {
            stopRecording();
          }

          return {
            ...prev,
            duration: newDuration,
            isDurationExceeded,
          };
        });
      }, 1000);

      setDurationInterval(interval);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [hasPermission, onError]);

  const stopRecording = useCallback(async () => {
    try {
      if (!recording) return;

      if (durationInterval) {
        clearInterval(durationInterval);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        onRecordingComplete?.(uri);
      }

      setRecording(null);
      setRecordingState({
        isRecording: false,
        isDurationExceeded: false,
        duration: 0,
        uri: uri || undefined,
      });
    } catch (error) {
      onError?.(error as Error);
    }
  }, [recording, durationInterval, onRecordingComplete, onError]);

  const cancelRecording = useCallback(async () => {
    try {
      if (!recording) return;

      if (durationInterval) {
        clearInterval(durationInterval);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Delete the recorded file
        await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
        ).then(({ sound }) => sound.unloadAsync());
      }

      setRecording(null);
      setRecordingState({
        isRecording: false,
        isDurationExceeded: false,
        duration: 0,
      });
    } catch (error) {
      onError?.(error as Error);
    }
  }, [recording, durationInterval, onError]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    hasPermission,
    isRecording: recordingState.isRecording,
    duration: recordingState.duration,
    formattedDuration: formatDuration(recordingState.duration),
    isDurationExceeded: recordingState.isDurationExceeded,
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermissions: checkPermissions,
  };
};

export default useVoiceRecording;