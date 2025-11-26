import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoleStore {
  userRole: 'client' | 'joseador' | null;
  setUserRole: (role: 'client' | 'joseador') => void;
  clearRole: () => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      userRole: null,
      setUserRole: (role) => set({ userRole: role }),
      clearRole: () => set({ userRole: null }),
    }),
    {
      name: 'role-storage',
    }
  )
);
