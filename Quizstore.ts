import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Explicit adapter so Zustand persist writes/reads from React Native AsyncStorage
// (AsyncStorage persists to device: iOS → UserDefaults, Android → SharedPreferences)
const reactNativeStorage: StateStorage = {
  getItem: async (name: string) => {
    const value = await AsyncStorage.getItem(name);
    return value;
  },
  setItem: async (name: string, value: string) => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

interface QuizState {
  credits: number;
  streak: number;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => void;
  increaseStreak: () => void;
  resetStreak: () => void;
}

const storageKey = 'quiz-storage';

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      credits: 0,
      streak: 0,

      addCredits: (amount: number) =>
        set((state) => ({ credits: state.credits + amount })),

      deductCredits: (amount: number) =>
        set((state) => ({
          credits: Math.max(0, state.credits - amount),
        })),

      increaseStreak: () =>
        set((state) => ({ streak: state.streak + 1 })),

      resetStreak: () => set({ streak: 0 }),
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => reactNativeStorage),
      // Only persist serializable state (credits, streak) to device storage
      partialize: (state) => ({ credits: state.credits, streak: state.streak }),
    }
  )
);
