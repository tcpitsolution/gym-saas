import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthUser {
  userId?: string;
  gymId?: string;
  role: string;
  ownerName?: string;
  gymName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  aadharNumber?: string;
  panNumber?: string;
  joiningDate?: string;
  gymAddress?: string;
  gymPhone?: string;
  gymEmail?: string;
  features?: {
    members?: boolean;
    payments?: boolean;
    trainers?: boolean;
    exercises?: boolean;
    askai?: boolean;
    reports?: boolean;
  };
  subscriptionStatus?: string;
  subscriptionEnd?: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
  fetchMe: () => Promise<void>;
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

const mergeMe = (state: AuthUser, data: any): AuthUser => ({
  ...state,
  ownerName: data.name,
  email: data.email,
  phone: data.phone,
  alternatePhone: data.alternatePhone,
  address: data.address,
  aadharNumber: data.aadharNumber,
  panNumber: data.panNumber,
  joiningDate: data.joiningDate,
  gymName: data.gymName,
  gymAddress: data.gymAddress,
  gymPhone: data.gymPhone,
  gymEmail: data.gymEmail,
  features: data.features,
  subscriptionStatus: data.subscriptionStatus,
  subscriptionEnd: data.subscriptionEnd,
});

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setToken: async (token: string) => {
    await AsyncStorage.setItem('token', token);
    const user = decodeJwt(token);
    set({ token, user });
    try {
      const { authApi } = await import('../api');
      const data = await authApi.getMe();
      set((state) => ({ user: state.user ? mergeMe(state.user, data) : state.user }));
    } catch {}
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, user: null });
  },

  updateUser: (patch: Partial<AuthUser>) =>
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...patch };
      const changed = (Object.keys(patch) as (keyof AuthUser)[]).some(
        (k) => state.user![k] !== patch[k],
      );
      return changed ? { user: updated } : state;
    }),

  fetchMe: async () => {
    try {
      const { authApi } = await import('../api');
      const data = await authApi.getMe();
      set((state) => ({ user: state.user ? mergeMe(state.user, data) : state.user }));
    } catch {}
  },

  loadFromStorage: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const user = decodeJwt(token);
        if (user && (user as any).exp && (user as any).exp * 1000 > Date.now()) {
          set({ token, user, isLoading: false });
          try {
            const { authApi } = await import('../api');
            const data = await authApi.getMe();
            set((state) => ({ user: state.user ? mergeMe(state.user, data) : state.user }));
          } catch {}
          return;
        }
        await AsyncStorage.removeItem('token');
      }
    } catch {}
    set({ isLoading: false });
  },
}));
