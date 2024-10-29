import { create } from "zustand";
import { request } from "./api";

export const usePageStore = create((set, get) => ({
  page: 'home',
  projects: [],
  projectNames: [],
  selectedProjectNames: [],
  handleConfirmSelect: () => {

  },
  getProjectNames: async () => {
    const projectNames = await request({ method: 'getProjectNames' });
    set({ projectNames });
  },
}));