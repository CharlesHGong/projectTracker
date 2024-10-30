import { create } from "zustand";
import { request } from "./api";

export const usePageStore = create((set, get) => ({
  page: 'home',
  startTime: undefined,
  now: undefined,
  workingProjectName: '',
  timeIntervalRef: undefined,
  projects: [],
  projectNames: [],
  selectedProjectNames: [],
  addLog: async (name, startTime, endTime) => {
    await request({ method: 'addLog', payload: { name, log: { startTime, endTime } } });
    set({
      projects: get().projects.map((project) => {
        if (project.name === name) {
          const newLogs = [...project.logs, { startTime, endTime }];
          newLogs.sort((a, b) => a.startTime - b.startTime);
          return {
            ...project,
            logs: newLogs
          }
        }
        return project;
      })
    });
  },
  loadProjects: async () => {
    const { selectedProjectNames } = get();
    request({ method: 'updateDisplayingProjectNames', payload: selectedProjectNames });
    const projects = await request({ method: 'getProjects', payload: selectedProjectNames });
    set({ projects });
  },
  getProjectNames: async () => {
    const { projectNames, selectedProjectNames } = await request({ method: 'getProjectNames' });
    set({ projectNames, selectedProjectNames });
    get().loadProjects();
  },
  handleStartOrStop: async (name, isStart) => {
    const { startTime, timeIntervalRef, workingProjectName, addLog } = get();
    if (isStart) {
      if (name !== workingProjectName && startTime) {
        clearInterval(timeIntervalRef);
        addLog(workingProjectName, startTime, Date.now());
      }
      const newTimeIntervalRef = setInterval(() => { set({ now: Date.now() }); }, 1000);
      set({ startTime: Date.now(), now: Date.now(), workingProjectName: name, timeIntervalRef: newTimeIntervalRef });
    } else {
      clearInterval(timeIntervalRef);
      addLog(name, startTime, Date.now());
      set({ startTime: undefined, now: undefined, workingProjectName: '', timeIntervalRef: undefined });
    }
  }
}));