//screens/SettingsScreen/components/common/PrivacySettings.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../../../styles/global';
import Animated, { withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

interface PrivacySettingsProps {
    profileVisibility: string;
    showOnlineStatus: boolean;
    onProfileVisibilityChange: (value: string) => void;
    onOnlineStatusChange: (value: boolean) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
    profileVisibility,
    showOnlineStatus,
    onProfileVisibilityChange,
    onOnlineStatusChange,
}) => {
    const [isOnline, setIsOnline] = useState(showOnlineStatus);
    const animatedWidth = useSharedValue(showOnlineStatus ? 20 : 0);

    const handleOnlineStatusChange = () => {
        const newValue = !isOnline;
        setIsOnline(newValue);
        onOnlineStatusChange(newValue);
        animatedWidth.value = withTiming(newValue ? 20 : 0);
    };

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: animatedWidth.value }],
    }));

    const renderVisibilityOption = (label: string, value: string) => (
        <TouchableOpacity
            key={value}
            style={{
                ...globalStyles.button.base,
                backgroundColor: profileVisibility === value ? globalStyles.colors.primary : globalStyles.colors.neutralLight,
                minWidth: '45%',
                marginBottom: globalStyles.spacing.xs,
            }}
            onPress={() => onProfileVisibilityChange(value)}
        >
            <Text style={{
                ...globalStyles.button.text,
                color: profileVisibility === value ? globalStyles.colors.white : globalStyles.colors.neutralDark,
            }}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[globalStyles.card, { padding: globalStyles.spacing.md }]}>
            <Text style={[globalStyles.h3, { marginBottom: globalStyles.spacing.sm }]}>Privacy Settings</Text>

            <View style={{ marginBottom: globalStyles.spacing.md }}>
                <Text style={[globalStyles.body, { marginBottom: globalStyles.spacing.xs }]}>Profile Visibility</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: globalStyles.spacing.xs }}>
                    {renderVisibilityOption("Public", "public")}
                    {renderVisibilityOption("Private", "private")}
                </View>
            </View>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: globalStyles.spacing.sm,
            }}>
                <Text style={globalStyles.body}>Show Online Status</Text>
                <TouchableOpacity
                    style={{
                        width: 40,
                        height: 24,
                        backgroundColor: isOnline ? globalStyles.colors.secondary : globalStyles.colors.neutralMedium,
                        borderRadius: 12,
                        padding: 2,
                    }}
                    onPress={handleOnlineStatusChange}
                >
                    <Animated.View
                        style={[
                            {
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: globalStyles.colors.white,
                            },
                            thumbStyle,
                        ]}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};