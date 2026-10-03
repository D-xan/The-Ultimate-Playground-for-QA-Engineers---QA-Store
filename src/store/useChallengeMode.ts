import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChallengeState {
  enabled: boolean;
  randomDelays: boolean;
  dynamicIds: boolean;
  flakyNetwork: boolean;
  duplicateElements: boolean;
  bugHunt: boolean;
  foundBugs: string[];
  toggleChallengeMode: () => void;
  updateSettings: (settings: Partial<Omit<ChallengeState, 'enabled' | 'foundBugs' | 'toggleChallengeMode' | 'updateSettings' | 'reportFound' | 'resetBugHunt'>>) => void;
  reportFound: (id: string) => void;
  resetBugHunt: () => void;
}

export const useChallengeMode = create<ChallengeState>()(
  persist(
    (set) => ({
      enabled: false,
      randomDelays: false,
      dynamicIds: false,
      flakyNetwork: false,
      duplicateElements: false,
      bugHunt: false,
      foundBugs: [],
      toggleChallengeMode: () => set((state) => ({ enabled: !state.enabled })),
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      reportFound: (id) =>
        set((state) => (state.foundBugs.includes(id) ? state : { foundBugs: [...state.foundBugs, id] })),
      resetBugHunt: () => set({ bugHunt: false, foundBugs: [] }),
    }),
    {
      name: 'qa-challenge-mode',
    }
  )
);
