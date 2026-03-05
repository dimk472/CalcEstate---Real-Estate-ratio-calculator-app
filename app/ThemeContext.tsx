// ─────────────────────────────────────────────────────────────────
//  ThemeContext.tsx
//  Global theme state — persists across tabs & app restarts
//
//  1. Wrap your root layout with <ThemeProvider>
//  2. Use useTheme() anywhere in the app
// ─────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';
import { Colors } from './Theme';

// ─── Types ───────────────────────────────────────────────────────

type ColorScheme = 'dark' | 'light';

interface ThemeContextValue {
    colorScheme: ColorScheme;
    C: typeof Colors.dark;        // resolved color tokens
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (scheme: ColorScheme) => void;
}

// ─── Storage key ─────────────────────────────────────────────────

const STORAGE_KEY = '@app_theme';

// ─── Context ─────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useSystemScheme(); // 'dark' | 'light' | null
    const [colorScheme, setColorScheme] = useState<ColorScheme>(
        systemScheme === 'light' ? 'light' : 'dark'
    );
    const [isLoaded, setIsLoaded] = useState(false);

    // Load persisted preference on mount
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((saved) => {
                if (saved === 'dark' || saved === 'light') {
                    setColorScheme(saved);
                }
                // If nothing saved, keep system default
            })
            .catch(() => {
                // Fallback: keep current value silently
            })
            .finally(() => setIsLoaded(true));
    }, []);

    // Persist whenever theme changes (skip the initial load)
    useEffect(() => {
        if (!isLoaded) return;
        AsyncStorage.setItem(STORAGE_KEY, colorScheme).catch(() => { });
    }, [colorScheme, isLoaded]);

    const toggleTheme = useCallback(() => {
        setColorScheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const setTheme = useCallback((scheme: ColorScheme) => {
        setColorScheme(scheme);
    }, []);

    const value: ThemeContextValue = {
        colorScheme,
        C: Colors[colorScheme],
        isDark: colorScheme === 'dark',
        toggleTheme,
        setTheme,
    };

    // Don't flash wrong theme before AsyncStorage loads
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used inside <ThemeProvider>');
    }
    return ctx;
}

// Expo Router treats modules inside app/ as routes.
// Keep a no-op default export to avoid route warnings for this context module.
export default function ThemeContextRoute() {
    return null;
}
