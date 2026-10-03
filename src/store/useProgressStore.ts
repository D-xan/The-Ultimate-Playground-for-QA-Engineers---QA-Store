import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  completedTasks: Record<string, number[]>; 
  totalTasks: Record<string, number>;
  toggleTask: (challengeId: string, taskIndex: number) => void;
  setTotalTasks: (challengeId: string, total: number) => void;
  isTaskCompleted: (challengeId: string, taskIndex: number) => boolean;
  getPageProgress: (challengeId: string) => number[];
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedTasks: {},
      totalTasks: {},
      setTotalTasks: (challengeId, total) => 
        set((state) => ({
          totalTasks: { ...state.totalTasks, [challengeId]: total }
        })),
      toggleTask: (challengeId: string, taskIndex: number) => 
        set((state) => {
          const pageTasks = state.completedTasks[challengeId] || [];
          const isCompleted = pageTasks.includes(taskIndex);
          const newTasks = isCompleted 
            ? pageTasks.filter(i => i !== taskIndex)
            : [...pageTasks, taskIndex];
            
          return {
            completedTasks: {
              ...state.completedTasks,
              [challengeId]: newTasks
            }
          };
        }),
      isTaskCompleted: (challengeId: string, taskIndex: number) => {
        return (get().completedTasks[challengeId] || []).includes(taskIndex);
      },
      getPageProgress: (challengeId: string) => {
        return get().completedTasks[challengeId] || [];
      },
      resetProgress: () => set({ completedTasks: {} }),
    }),
    {
      name: 'qa-playground-progress-v2',
    }
  )
);
