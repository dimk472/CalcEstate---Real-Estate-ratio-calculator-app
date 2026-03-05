import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
    Animated,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

// ─────────────────────────────────────────────────────────────────
//  ThemeToggle — animated dark/light mode button
//  No props needed — reads from ThemeContext automatically
//  Usage: <ThemeToggle />
// ─────────────────────────────────────────────────────────────────

import { useTheme } from './ThemeContext';

export function ThemeToggle() {
    const { C, isDark, toggleTheme: onToggle } = useTheme();

    // Rotation animation: sun spins in, moon spins out
    const rotation = useRef(new Animated.Value(isDark ? 0 : 1)).current;
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.82,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 4,
                    tension: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(rotation, {
                    toValue: isDark ? 1 : 0,
                    duration: 320,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        onToggle();
    };

    const rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.8}
                style={[
                    styles.button,
                    {
                        backgroundColor: C.bg3,
                        borderColor: isDark ? C.accentMid : C.border1,
                    },
                ]}
            >
                {/* Accent glow ring — visible in dark mode */}
                {isDark && (
                    <View
                        style={[
                            styles.glowRing,
                            { borderColor: C.accentMid },
                        ]}
                    />
                )}

                <Animated.View style={{ transform: [{ rotate }] }}>
                    <Ionicons
                        name={isDark ? 'moon' : 'sunny'}
                        size={18}
                        color={isDark ? C.accent : '#F59E0B'}
                    />
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        overflow: 'visible',
    },
    glowRing: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        opacity: 0.4,
    },
});

export default ThemeToggle;
