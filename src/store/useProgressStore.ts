import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toggle, complete, registerGroup, type ProgressData } from './progressLogic';

interface ProgressState extends ProgressData {
  toggleTask: (pageId: string, key: string) => void;
  completeTask: (pageId: string, key: string) => void;
  registerGroup: (pageId: string, groupId: string, count: number) => void;
  resetProgress: () => void;
  resetPage: (pageId: string) => void;
}

// v2 keyed tasks by page only, so its data is ambiguous; drop it.
try { localStorage.removeItem('qa-playground-progress-v2'); } catch { /* storage unavailable */ }

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      totals: {},
      toggleTask: (pageId, key) => set((s) => toggle(s, pageId, key)),
      completeTask: (pageId, key) => set((s) => complete(s, pageId, key)),
      registerGroup: (pageId, groupId, count) => set((s) => registerGroup(s, pageId, groupId, count)),
      resetProgress: () => set({ completed: {} }),
      resetPage: (pageId) => set((s) => ({ completed: { ...s.completed, [pageId]: [] } })),
    }),
    { name: 'qa-playground-progress-v3' }
  )
);
