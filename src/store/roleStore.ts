import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoleStore {
  userRole: 'client' | 'joseador' | null;
  clientOnboardingCompleted: boolean;
  joseadorOnboardingCompleted: boolean;
  currentUserId: string | null;
  setUserRole: (role: 'client' | 'joseador') => void;
  setClientOnboardingCompleted: (completed: boolean) => void;
  setJoseadorOnboardingCompleted: (completed: boolean) => void;
  setCurrentUserId: (userId: string | null) => void;
  clearRole: () => void;
  clearAllUserData: () => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      userRole: null,
      clientOnboardingCompleted: false,
      joseadorOnboardingCompleted: false,
      currentUserId: null,
      setUserRole: (role) => set({ userRole: role }),
      setClientOnboardingCompleted: (completed) => set({ clientOnboardingCompleted: completed }),
      setJoseadorOnboardingCompleted: (completed) => set({ joseadorOnboardingCompleted: completed }),
      setCurrentUserId: (userId) => set({ currentUserId: userId }),
      clearRole: () => set({ userRole: null }),
      clearAllUserData: () => set({
        userRole: null,
        clientOnboardingCompleted: false,
        joseadorOnboardingCompleted: false,
        currentUserId: null,
      }),
    }),
    {
      name: 'role-storage',
    }
  )
);
