import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoleStore {
  userRole: 'client' | 'joseador' | null;
  clientOnboardingCompleted: boolean;
  joseadorOnboardingCompleted: boolean;
  currentUserId: string | null;
  activeClientTab: 'home' | 'applications' | 'messages' | 'wallet' | 'profile';
  activeJoseadorTab: 'home' | 'applications' | 'messages' | 'wallet' | 'profile';
  setUserRole: (role: 'client' | 'joseador') => void;
  setClientOnboardingCompleted: (completed: boolean) => void;
  setJoseadorOnboardingCompleted: (completed: boolean) => void;
  setCurrentUserId: (userId: string | null) => void;
  setActiveClientTab: (tab: 'home' | 'applications' | 'messages' | 'wallet' | 'profile') => void;
  setActiveJoseadorTab: (tab: 'home' | 'applications' | 'messages' | 'wallet' | 'profile') => void;
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
      activeClientTab: 'home',
      activeJoseadorTab: 'home',
      setUserRole: (role) => set({ userRole: role }),
      setClientOnboardingCompleted: (completed) => set({ clientOnboardingCompleted: completed }),
      setJoseadorOnboardingCompleted: (completed) => set({ joseadorOnboardingCompleted: completed }),
      setCurrentUserId: (userId) => set({ currentUserId: userId }),
      setActiveClientTab: (tab) => set({ activeClientTab: tab }),
      setActiveJoseadorTab: (tab) => set({ activeJoseadorTab: tab }),
      clearRole: () => set({ userRole: null }),
      clearAllUserData: () => set({
        userRole: null,
        clientOnboardingCompleted: false,
        joseadorOnboardingCompleted: false,
        currentUserId: null,
        activeClientTab: 'home',
        activeJoseadorTab: 'home',
      }),
    }),
    {
      name: 'role-storage',
    }
  )
);
