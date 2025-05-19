export const ACTIVITY_OPTIONS = [
  { label: "Exercise", value: "Exercise" },
  { label: "Meditation", value: "Meditation" },
  { label: "Reading", value: "Reading" },
  { label: "Socializing", value: "Socializing" },
  { label: "Cooking", value: "Cooking" },
  { label: "Working", value: "Working" },
  { label: "Sleeping", value: "Sleeping" },
  { label: "Walking", value: "Walking" },
  { label: "Running", value: "Running" },
  { label: "Yoga", value: "Yoga" },
  { label: "Dancing", value: "Dancing" },
  { label: "Gaming", value: "Gaming" },
  { label: "Traveling", value: "Traveling" },
  { label: "Shopping", value: "Shopping" },
  { label: "Listening to Music", value: "Listening to Music" },
  { label: "Watching TV", value: "Watching TV" },
  { label: "Gardening", value: "Gardening" },
  { label: "Art", value: "Art" },
  { label: "Writing", value: "Writing" },
  { label: "Cleaning", value: "Cleaning" },
];

export const ENERGY_LEVELS = [
  { label: "😴", value: 1, description: "Very Low" },
  { label: "🥱", value: 2, description: "Low" },
  { label: "😐", value: 3, description: "Moderate" },
  { label: "😊", value: 4, description: "High" },
  { label: "🤩", value: 5, description: "Very High" },
];

export const MOOD_DESCRIPTIONS = {
  1: "Very Low",
  2: "Very Low",
  3: "Low",
  4: "Low",
  5: "Moderate",
  6: "Moderate",
  7: "Good",
  8: "Good",
  9: "Excellent",
  10: "Excellent",
};

export const getMoodDescription = (rating: number): string => {
  if (rating <= 2) return "Very Low";
  if (rating <= 4) return "Low";
  if (rating <= 6) return "Moderate";
  if (rating <= 8) return "Good";
  return "Excellent";
};
