import { create } from 'zustand';
import { JobApplications } from '@/entities';

interface ApplicationStore {
  applications: JobApplications[];
  setApplications: (applications: JobApplications[]) => void;
  addApplication: (application: JobApplications) => void;
  updateApplication: (application: JobApplications) => void;
  removeApplication: (applicationId: string) => void;
  clearApplications: () => void;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  setApplications: (applications) => set({ applications }),
  addApplication: (application) => set((state) => ({
    applications: [application, ...state.applications]
  })),
  updateApplication: (application) => set((state) => ({
    applications: state.applications.map(app => 
      app._id === application._id ? application : app
    )
  })),
  removeApplication: (applicationId) => set((state) => ({
    applications: state.applications.filter(app => app._id !== applicationId)
  })),
  clearApplications: () => set({ applications: [] })
}));
