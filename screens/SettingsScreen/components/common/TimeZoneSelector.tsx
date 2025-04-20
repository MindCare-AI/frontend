import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { globalStyles } from '../../../../styles/global';
import { timezones } from '../constants';

interface TimeZoneSelectorProps {
  currentTimezone: string;
  onTimezoneChange: (timezone: string) => void;
}

export const TimeZoneSelector: React.FC<TimeZoneSelectorProps> = ({
  currentTimezone,
  onTimezoneChange,
}) => {
  const [searchText, setSearchText] = useState<string>('');

  const filteredTimezones = timezones.filter((tz) =>
    tz.value.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleTimezonePress = useCallback(
    (timezone: string) => {
      onTimezoneChange(timezone);
    },
    [onTimezoneChange]
  );

  return (
    <View style={[globalStyles.card, { padding: globalStyles.spacing.md }]}>
      <Text style={[globalStyles.h3, { marginBottom: globalStyles.spacing.sm }]}>
        Select your timezone:
      </Text>
      <ScrollView style={{ maxHeight: 200 }}>
        {filteredTimezones.map((tz) => (
          <TouchableOpacity
            key={tz.value}
            style={{
              ...globalStyles.button.base,
              backgroundColor:
                currentTimezone === tz.value
                  ? globalStyles.colors.primary
                  : globalStyles.colors.neutralLight,
              marginBottom: globalStyles.spacing.xs,
            }}
            onPress={() => handleTimezonePress(tz.value)}
          >
            <Text
              style={{
                ...globalStyles.button.text,
                color:
                  currentTimezone === tz.value
                    ? globalStyles.colors.white
                    : globalStyles.colors.neutralDark,
              }}
            >
              {tz.value}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};