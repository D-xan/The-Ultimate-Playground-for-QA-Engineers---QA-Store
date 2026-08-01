import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'customer' | 'admin' | null;

interface AuthState {
  user: any | null;
  role: Role;
  login: (user: any, role: Role) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      login: (user, role) => set({ user, role }),
      logout: () => set({ user: null, role: null }),
    }),
    {
      name: 'qa-auth-storage',
    }
  )
);
