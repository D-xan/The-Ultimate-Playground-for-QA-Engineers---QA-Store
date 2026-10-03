import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InterviewState {
  known: string[];
  toggleKnown: (id: string) => void;
  setKnown: (id: string, known: boolean) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      known: [],
      toggleKnown: (id) => set((s) => ({ known: s.known.includes(id) ? s.known.filter((k) => k !== id) : [...s.known, id] })),
      setKnown: (id, known) => set((s) => {
        const has = s.known.includes(id);
        if (known === has) return s;
        return { known: known ? [...s.known, id] : s.known.filter((k) => k !== id) };
      }),
      reset: () => set({ known: [] }),
    }),
    { name: 'qa-interview-kit' }
  )
);
