import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChallengeState {
  enabled: boolean;
  randomDelays: boolean;
  dynamicIds: boolean;
  flakyNetwork: boolean;
  duplicateElements: boolean;
  toggleChallengeMode: () => void;
  updateSettings: (settings: Partial<Omit<ChallengeState, 'enabled' | 'toggleChallengeMode' | 'updateSettings'>>) => void;
}

export const useChallengeMode = create<ChallengeState>()(
  persist(
    (set) => ({
      enabled: false,
      randomDelays: false,
      dynamicIds: false,
      flakyNetwork: false,
      duplicateElements: false,
      toggleChallengeMode: () => set((state) => ({ enabled: !state.enabled })),
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'qa-challenge-mode',
    }
  )
);
