import { create } from 'zustand';
import { TrabajosdeServicio } from '@/entities';

interface JobStore {
  jobToDuplicate: TrabajosdeServicio | null;
  setJobToDuplicate: (job: TrabajosdeServicio | null) => void;
  clearJobToDuplicate: () => void;
}

export const useJobStore = create<JobStore>((set) => ({
  jobToDuplicate: null,
  setJobToDuplicate: (job) => set({ jobToDuplicate: job }),
  clearJobToDuplicate: () => set({ jobToDuplicate: null }),
}));
