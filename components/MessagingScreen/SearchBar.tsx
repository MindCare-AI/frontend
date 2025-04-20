//screens/MessagingScreen/components/SearchBar.tsx
import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../styles/global';

// Define interface for component props
interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleClear = () => {
        onChangeText('');
    };

    const containerBackground = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [globalStyles.colors.primary, globalStyles.colors.primaryDark]
    });

    const shadowOpacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.06, 0.15]
    });

    return (
        <Animated.View style={{
            paddingHorizontal: globalStyles.spacing.md,
            paddingTop: globalStyles.spacing.sm,
            paddingBottom: globalStyles.spacing.sm,
            backgroundColor: containerBackground,
        }}>
            <Animated.View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: globalStyles.colors.white,
                    borderRadius: globalStyles.spacing.md,
                    paddingHorizontal: globalStyles.spacing.md,
                    height: 48,
                    shadowColor: globalStyles.colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 6,
                    elevation: 4,
                    borderWidth: 1,
                    borderColor: isFocused ? globalStyles.colors.primary : 'transparent',
                    shadowOpacity: isFocused ? 0.15 : 0.06,
                }}
            >
                <Icon
                    name="search"
                    size={20}
                    color={isFocused ? globalStyles.colors.primary : globalStyles.colors.icon}
                    style={{ marginRight: globalStyles.spacing.xs }}
                />
                <TextInput
                    style={{
                        flex: 1,
                        ...globalStyles.body,
                        fontSize: 16,
                        color: globalStyles.colors.textPrimary,
                        height: '100%',
                        paddingVertical: globalStyles.spacing.xs,
                    }}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="Search conversations"
                    placeholderTextColor={globalStyles.colors.textPlaceholder}
                    returnKeyType="search"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClear}
                        style={{
                            padding: globalStyles.spacing.xs,
                            borderRadius: globalStyles.spacing.md,
                        }}
                        activeOpacity={0.7}
                    >
                        <Icon name="close-circle" size={18} color={globalStyles.colors.icon} />
                    </TouchableOpacity>
                )}
            </Animated.View>
        </Animated.View>
    );
};

export default SearchBar;