import { create } from 'zustand';
import { Audio } from 'expo-av';

interface AudioPlaybackState {
  currentlyPlaying: string | null;
  sound: Audio.Sound | null;
  setCurrentlyPlaying: (messageId: string | null) => void;
  setSound: (sound: Audio.Sound | null) => void;
  stopCurrentPlayback: () => Promise<void>;
}

const useAudioPlaybackStore = create<AudioPlaybackState>((set, get) => ({
  currentlyPlaying: null,
  sound: null,
  setCurrentlyPlaying: (messageId) => set({ currentlyPlaying: messageId }),
  setSound: (sound) => set({ sound }),
  stopCurrentPlayback: async () => {
    const { sound, currentlyPlaying } = get();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    set({ sound: null, currentlyPlaying: null });
  },
}));

export const useAudioPlayback = () => {
  const {
    currentlyPlaying,
    setCurrentlyPlaying,
    setSound,
    stopCurrentPlayback,
  } = useAudioPlaybackStore();

  const playAudio = async (messageId: string, uri: string) => {
    try {
      // Stop any currently playing audio
      if (currentlyPlaying && currentlyPlaying !== messageId) {
        await stopCurrentPlayback();
      }

      // Load and play new audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status: any) => {
          if (status.didJustFinish) {
            setCurrentlyPlaying(null);
            setSound(null);
          }
        }
      );

      setSound(newSound);
      setCurrentlyPlaying(messageId);

      return newSound;
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  };

  const pauseAudio = async () => {
    const { sound } = useAudioPlaybackStore.getState();
    if (sound) {
      await sound.pauseAsync();
      setCurrentlyPlaying(null);
    }
  };

  const resumeAudio = async (messageId: string) => {
    const { sound } = useAudioPlaybackStore.getState();
    if (sound) {
      await sound.playAsync();
      setCurrentlyPlaying(messageId);
    }
  };

  const stopAudio = async () => {
    await stopCurrentPlayback();
  };

  return {
    currentlyPlaying,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
  };
};

export default useAudioPlayback;