import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Framework = 'playwright' | 'seleniumJava' | 'seleniumPython' | 'cypress';

interface FrameworkPrefState {
  framework: Framework;
  setFramework: (framework: Framework) => void;
}

/** The language the learner last picked in any code panel; every hint and solution opens on it. */
export const useFrameworkPref = create<FrameworkPrefState>()(
  persist(
    (set) => ({
      framework: 'playwright',
      setFramework: (framework) => set({ framework }),
    }),
    { name: 'qa-framework-pref' }
  )
);
