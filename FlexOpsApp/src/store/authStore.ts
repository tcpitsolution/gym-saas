import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthUser {
  userId?: string;
  gymId?: string;
  role: string;
  ownerName?: string;
  gymName?: string;
  email?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

function decodeJwt(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setToken: async (token: string) => {
    await AsyncStorage.setItem('token', token);
    const user = decodeJwt(token);
    set({ token, user });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, user: null });
  },

  loadFromStorage: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const user = decodeJwt(token);
        // Check token expiry
        if (user && (user as any).exp && (user as any).exp * 1000 > Date.now()) {
          set({ token, user, isLoading: false });
          return;
        }
        await AsyncStorage.removeItem('token');
      }
    } catch {}
    set({ isLoading: false });
  },
}));
