import { create } from "zustand";

// This app uses manual screen switching via Zustand store in app/index.tsx
// (no React Navigation or expo-router). Any component can navigate
// without prop-drilling by using this store.

export type Screen =
  | "index"
  | "attendance"
  | "members"
  | "plans"
  | "payments"
  | "exercises"
  | "exerciseDetail"
  | "askai"
  | "profile"
  | "addMember"
  | "trainers";

interface NavigationState {
  screen: Screen;
  // Screen-specific extra data, e.g. { autoScan: true } for attendance screen
  params?: Record<string, any>;
  setScreen: (screen: Screen, params?: Record<string, any>) => void;
  clearParams: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  screen: "index",
  params: undefined,
  setScreen: (screen, params) => set({ screen, params }),
  clearParams: () => set({ params: undefined }),
}));
