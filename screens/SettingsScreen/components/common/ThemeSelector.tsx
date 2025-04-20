//screens/SettingsScreen/components/common/ThemeSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colorSchemes } from '../../constants';
import { globalStyles } from '../../../../styles/global'; // Assuming this path is correct

interface ThemeSelectorProps {
    currentMode: string;
    currentColor: string;
    onSelectMode: (mode: string) => void;
    onSelectColor: (color: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    currentMode,
    currentColor,
    onSelectMode,
    onSelectColor,
}) => {
    const modes = [
        { label: 'System Default', value: 'system' },
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
    ];

    return (
        <View style={[globalStyles.card, { padding: globalStyles.spacing.md }]}>
            <Text style={[globalStyles.h3, { marginBottom: globalStyles.spacing.sm }]}>Theme Mode</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: globalStyles.spacing.xs }}>
                {modes.map((mode) => (
                    <TouchableOpacity
                        key={mode.value}
                        style={{
                            ...globalStyles.button.base,
                            backgroundColor: currentMode === mode.value ? globalStyles.colors.primary : globalStyles.colors.neutralLight,
                            minWidth: '45%',
                            marginBottom: globalStyles.spacing.xs,
                        }}
                        onPress={() => onSelectMode(mode.value)}
                    >
                        <Text style={{
                            ...globalStyles.button.text,
                            color: currentMode === mode.value ? globalStyles.colors.white : globalStyles.colors.neutralDark,
                        }}>
                            {mode.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[globalStyles.h3, { marginTop: globalStyles.spacing.md, marginBottom: globalStyles.spacing.sm }]}>Color Scheme</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: globalStyles.spacing.xs }}>
                {colorSchemes.map((scheme) => (
                    <TouchableOpacity
                        key={scheme.value}
                        style={{
                            ...globalStyles.button.base,
                            backgroundColor: currentColor === scheme.value ? globalStyles.colors.primary : globalStyles.colors.neutralLight,
                            minWidth: '45%',
                            marginBottom: globalStyles.spacing.xs,
                        }}
                        onPress={() => onSelectColor(scheme.value)}
                    >
                        <Text style={{
                            ...globalStyles.button.text,
                            color: currentColor === scheme.value ? globalStyles.colors.white : globalStyles.colors.neutralDark,
                        }}>
                            {scheme.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};