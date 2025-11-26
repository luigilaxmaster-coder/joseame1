import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoleStore {
  userRole: 'client' | 'joseador' | null;
  clientOnboardingCompleted: boolean;
  joseadorOnboardingCompleted: boolean;
  setUserRole: (role: 'client' | 'joseador') => void;
  setClientOnboardingCompleted: (completed: boolean) => void;
  setJoseadorOnboardingCompleted: (completed: boolean) => void;
  clearRole: () => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      userRole: null,
      clientOnboardingCompleted: false,
      joseadorOnboardingCompleted: false,
      setUserRole: (role) => set({ userRole: role }),
      setClientOnboardingCompleted: (completed) => set({ clientOnboardingCompleted: completed }),
      setJoseadorOnboardingCompleted: (completed) => set({ joseadorOnboardingCompleted: completed }),
      clearRole: () => set({ userRole: null }),
    }),
    {
      name: 'role-storage',
    }
  )
);
