import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Weather } from '../../types/journal';

const weatherIcons: Record<Weather, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
};

const weatherLabels: Record<Weather, string> = {
  sunny: 'Sunny',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
  stormy: 'Stormy',
  snowy: 'Snowy',
};

interface WeatherSelectorProps {
  selectedWeather: Weather | null;
  onWeatherSelect: (weather: Weather) => void;
  label?: string;
}

const WeatherSelector: React.FC<WeatherSelectorProps> = ({
  selectedWeather,
  onWeatherSelect,
  label = 'What\'s the weather like?'
}) => {
  const weatherTypes: Weather[] = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.weatherContainer}>
        {weatherTypes.map((weather) => (
          <TouchableOpacity
            key={weather}
            style={[
              styles.weatherItem,
              selectedWeather === weather && styles.selectedWeatherItem
            ]}
            onPress={() => onWeatherSelect(weather)}
          >
            <Text style={styles.weatherIcon}>{weatherIcons[weather]}</Text>
            <Text style={styles.weatherLabel}>{weatherLabels[weather]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  weatherItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '18%',
    marginBottom: 10,
  },
  selectedWeatherItem: {
    backgroundColor: '#e0f7fa',
    borderColor: '#0097a7',
  },
  weatherIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  weatherLabel: {
    fontSize: 12,
  },
});

export default WeatherSelector;