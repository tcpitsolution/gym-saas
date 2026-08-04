import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../theme/colors';

interface ThemeState {
  isDark: boolean;
  colors: typeof darkColors;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true,
  colors: darkColors,

  toggleTheme: async () => {
    const next = !get().isDark;
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light');
    set({ isDark: next, colors: next ? darkColors : lightColors });
  },

  loadTheme: async () => {
    const saved = await AsyncStorage.getItem('theme');
    const isDark = saved !== 'light';
    set({ isDark, colors: isDark ? darkColors : lightColors });
  },
}));

// Convenience hook — use this in every screen instead of importing colors directly
export function useTheme() {
  return useThemeStore(s => s.colors);
}
