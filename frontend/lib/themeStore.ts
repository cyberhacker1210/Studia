import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (value: boolean) => void;
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((state) => {
        const newIsDark = !state.isDark;

        // ✅ CORRECTION : Appliquer sur document.documentElement
        if (typeof window !== 'undefined') {
          if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        }

        return { isDark: newIsDark };
      }),
      setDark: (value: boolean) => set(() => {
        if (typeof window !== 'undefined') {
          if (value) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        }
        return { isDark: value };
      }),
    }),
    {
      name: 'studia-theme',
      // ✅ CORRECTION : Charger le theme au démarrage
      onRehydrateStorage: () => (state) => {
        if (typeof window !== 'undefined' && state?.isDark) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);