import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { globalStyles } from '../../../../styles/global';
import { timezones, TimeZone } from '../../constants';

interface TimeZoneSelectorProps {
  currentTimezone: string;
  onTimezoneChange: (timezone: string) => void;
}

export const TimeZoneSelector: React.FC<TimeZoneSelectorProps> = ({
  currentTimezone,
  onTimezoneChange,
}) => {
  const [searchText, setSearchText] = useState<string>('');

  const filteredTimezones = timezones.filter((tz: TimeZone) =>
    tz.value.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleTimezonePress = useCallback(
    (timezone: string) => {
      onTimezoneChange(timezone);
    },
    [onTimezoneChange]
  );

  return (
    <View style={[styles.card, { padding: globalStyles.spacing.md }]}>
      <Text style={styles.title}>
        Select your timezone:
      </Text>
      <ScrollView style={{ maxHeight: 200 }}>
        {filteredTimezones.map((tz) => (
          <TouchableOpacity
            key={tz.value}
            style={[
              styles.button,
              {
                backgroundColor:
                  currentTimezone === tz.value
                    ? globalStyles.colors.primary
                    : globalStyles.colors.neutralLight,
                marginBottom: globalStyles.spacing.xs,
              }
            ]}
            onPress={() => handleTimezonePress(tz.value)}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    currentTimezone === tz.value
                      ? globalStyles.colors.white
                      : globalStyles.colors.neutralDark,
                }
              ]}
            >
              {tz.value}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...globalStyles.card,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: globalStyles.spacing.sm,
  },
  button: {
    paddingVertical: globalStyles.spacing.sm,
    paddingHorizontal: globalStyles.spacing.md,
    borderRadius: globalStyles.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  }
});