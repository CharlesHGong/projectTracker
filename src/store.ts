import { create } from "zustand";
import { request } from "./api";
import { Log, MinimizeVariant, Project, TimeRangeOption } from "./types";

const moveItemToFront = <T,>(
  items: T[],
  predicate: (item: T) => boolean
): T[] => {
  const itemIndex = items.findIndex(predicate);
  if (itemIndex <= 0) {
    return items;
  }
  const nextItems = Array.from(items);
  const [item] = nextItems.splice(itemIndex, 1);
  nextItems.unshift(item);
  return nextItems;
};

type PageStore = {
  page: string;
  minimize: boolean;
  minimizeVariant: MinimizeVariant;
  range: TimeRangeOption;
  bgAlpha: number;
  setBgAlpha: (a: number) => void;
  startTime: number | undefined;
  now: number | undefined;
  workingProjectName: string;
  lastStartedProjectName: string;
  timeIntervalRef: NodeJS.Timeout | undefined;
  projects: Project[];
  projectNames: string[];
  selectedProjectNames: string[];
  reorderList: (sourceIndex: number, destinationIndex: number) => void;
  addLog: (name: string, startTime: number, endTime: number) => void;
  updateLog: (project: Project, previous: Log, after: Log) => Promise<Project>;
  loadProjects: () => void;
  deleteProject: (name: string) => void;
  getProjectNames: () => void;
  handleStartOrStop: (name: string, isStart: boolean) => void;
  updateProjectDetails: (
    name: string,
    updates: Partial<Pick<Project, "name" | "code">>
  ) => Promise<void>;
};

export const usePageStore = create<PageStore>((set, get) => ({
  page: "home",
  minimize: false,
  minimizeVariant: "minimize",
  range: "day",
  bgAlpha: parseFloat(localStorage.getItem("bgAlpha") ?? "0.8"),
  setBgAlpha: (a) => {
    set({ bgAlpha: a });
    localStorage.setItem("bgAlpha", String(a));
  },
  startTime: undefined,
  now: undefined,
  workingProjectName: "",
  lastStartedProjectName: "",
  timeIntervalRef: undefined,
  projects: [],
  projectNames: [],
  selectedProjectNames: [],
  reorderList: (sourceIndex, destinationIndex) => {
    const { selectedProjectNames, projects } = get();
    const reorderedNames = Array.from(selectedProjectNames);
    const [removedName] = reorderedNames.splice(sourceIndex, 1);
    reorderedNames.splice(destinationIndex, 0, removedName);

    const reorderedProjects = Array.from(projects);
    const [removedProject] = reorderedProjects.splice(sourceIndex, 1);
    reorderedProjects.splice(destinationIndex, 0, removedProject);
    set({ selectedProjectNames: reorderedNames, projects: reorderedProjects });
    request({
      method: "updateDisplayingProjectNames",
      payload: reorderedNames,
    });
  },
  addLog: async (name, startTime, endTime) => {
    await request({
      method: "addLog",
      payload: { name, log: { startTime, endTime } },
    });
    set({
      projects: get().projects.map((project) => {
        if (project.name === name) {
          const newLogs = [...project.logs, { startTime, endTime }];
          newLogs.sort((a, b) => a.startTime - b.startTime);
          return {
            ...project,
            logs: newLogs,
          };
        }
        return project;
      }),
    });
  },
  updateLog: async (project, previous, after) => {
    const newProject = {
      ...project,
      logs: project.logs.map((l) =>
        l.startTime === previous.startTime && l.endTime === previous.endTime
          ? after
          : l
      ),
    };
    await request({
      method: "updateProject",
      payload: { name: project.name, project: newProject },
    });
    get().loadProjects();
    return newProject;
  },
  loadProjects: async () => {
    const { selectedProjectNames, range } = get();
    request({
      method: "updateDisplayingProjectNames",
      payload: selectedProjectNames,
    });
    const projects: Project[] = await request({
      method: "getProjects",
      payload: { projectNames: selectedProjectNames, range },
    });
    set({ projects });
  },
  deleteProject: async (name) => {
    const { selectedProjectNames, projects } = get();
    await request({ method: "deleteProject", payload: name });
    set({
      selectedProjectNames: selectedProjectNames.filter((pn) => pn !== name),
      projects: projects.filter((p) => p.name !== name),
    });
  },
  getProjectNames: async () => {
    const { projectNames, selectedProjectNames } = await request({
      method: "getProjectNames",
      payload: undefined,
    });
    set({ projectNames, selectedProjectNames });
    get().loadProjects();
  },
  handleStartOrStop: async (name, isStart) => {
    const { startTime, timeIntervalRef, workingProjectName, addLog } = get();
    const reorderedSelectedProjectNames = moveItemToFront(
      get().selectedProjectNames,
      (projectName) => projectName === name
    );
    const reorderedProjects = moveItemToFront(
      get().projects,
      (project) => project.name === name
    );
    set({
      selectedProjectNames: reorderedSelectedProjectNames,
      projects: reorderedProjects,
    });
    request({
      method: "updateDisplayingProjectNames",
      payload: reorderedSelectedProjectNames,
    });

    if (isStart) {
      if (name !== workingProjectName && startTime) {
        clearInterval(timeIntervalRef);
        addLog(workingProjectName, startTime, Date.now());
      }
      const newTimeIntervalRef = setInterval(() => {
        set({ now: Date.now() });
      }, 1000);
      set({
        startTime: Date.now(),
        now: Date.now(),
        workingProjectName: name,
        lastStartedProjectName: name,
        timeIntervalRef: newTimeIntervalRef,
      });
    } else {
      clearInterval(timeIntervalRef);
      addLog(name, startTime ?? Date.now(), Date.now());
      set({
        startTime: undefined,
        now: undefined,
        workingProjectName: "",
        timeIntervalRef: undefined,
      });
    }
  },
  updateProjectDetails: async (name, updates) => {
    await request({
      method: "updateProject",
      payload: { name, project: updates },
    });
    if (updates.name && updates.name !== name) {
      set({ page: `project/${updates.name}` });
    }
    await get().getProjectNames();
  },
}));
