import { create } from "zustand";
import { request } from "./api";

export const usePageStore = create((set, get) => ({
  page: 'home',
  projects: [],
  projectNames: [],
  selectedProjectNames: [],
  addLog: async (name, startTime, endTime) => {
    await request({ method: 'addLog', payload: { name, log: { startTime, endTime } } });
    set({
      projects: get().projects.map((project) => {
        if (project.name === name) {
          return {
            ...project,
            logs: [...project.logs, { startTime, endTime }]
          }
        }
        return project;
      })
    });
  },
  loadProjects: async () => {
    const { selectedProjectNames } = get();
    const projects = await request({ method: 'getProjects', payload: selectedProjectNames });
    set({ projects });
  },
  getProjectNames: async () => {
    const projectNames = await request({ method: 'getProjectNames' });
    set({ projectNames });
  },
}));