import { JSONFilePreset } from 'lowdb/node';
import { app } from 'electron';
import { getStartOfRange } from './dateUtils.mjs';

const APP_NAME = 'projectTimeTracker';

const defaultDb = {
  projects: [],
  displayingProjectNames: [],
};

const normalizeProject = (project) => ({
  ...project,
  code: project.code ?? '',
  logs: project.logs ?? [],
});
console.log('db location', `${app.getPath('appData')}/${APP_NAME}/db.json`);
const loadDb = async () => {
  const db = await JSONFilePreset(`${app.getPath('appData')}/${APP_NAME}/db.json`, defaultDb);
  db.read();
  return db;
};

export const createProject = async (name) => {
  const db = await loadDb();
  db.data.projects.push({ name, code: '', logs: [] });
  await db.write();
  return;
};

export const addLog = async ({ name, log }) => {
  const db = await loadDb();
  const project = db.data.projects.find((project) => project.name === name);
  project.logs.push(log);
  project.logs.sort((a, b) => a.startTime - b.startTime);
  await db.write();
  return;
}

export const getProjects = async ({ projectNames, range }) => {
  const db = await loadDb();
  const lowerBound = getStartOfRange(Date.now(), range);
  const unOrderedProjects = db.data.projects
    .filter((project) => projectNames.includes(project.name))
    .map((project) => {
      const normalizedProject = normalizeProject(project);
      return {
        ...normalizedProject,
        logs: normalizedProject.logs.filter((log) => log.startTime >= lowerBound),
      };
    });
  return projectNames.map((name) => unOrderedProjects.find((project) => project.name === name)).filter(Boolean);
}

export const getProject = async (name) => {
  const db = await loadDb();
  const project = db.data.projects.find((item) => item.name === name);
  return project ? normalizeProject(project) : undefined;
}

export const updateProject = async ({ name, project }) => {
  const db = await loadDb();
  const nextName = project.name;
  db.data.projects = db.data.projects.map((p) =>
    p.name === name ? normalizeProject({ ...p, ...project }) : normalizeProject(p)
  );
  if (nextName && nextName !== name) {
    db.data.displayingProjectNames = db.data.displayingProjectNames.map((projectName) =>
      projectName === name ? nextName : projectName
    );
  }
  await db.write();
  return;
}

export const deleteProject = async (name) => {
  const db = await loadDb();
  db.data.projects = db.data.projects.filter((project) => project.name !== name);
  db.data.displayingProjectNames = db.data.displayingProjectNames.filter((projectName) => projectName !== name);
  await db.write();
  return;
}

export const getProjectNames = async () => {
  const db = await loadDb();
  const projectNames = db.data.projects.map((project) => project.name);
  const selectedProjectNames = db.data.displayingProjectNames.filter(n => projectNames.includes(n));
  projectNames.sort();
  return { projectNames, selectedProjectNames };
}

export const updateDisplayingProjectNames = async (selectedProjectNames) => {
  const db = await loadDb();
  db.data.displayingProjectNames = selectedProjectNames;
  await db.write();
  return;
}

export const getLogsBetweenDates = async ({ startDate, endDate }) => {
  const db = await loadDb();
  const logs = db.data.projects.flatMap((project) => (
    normalizeProject(project).logs
      .filter((log) => log.startTime >= startDate && log.endTime <= endDate)
      .map((log) => ({
        ...log,
        projectName: project.name,
        projectCode: project.code ?? '',
      }))
  ));
  return logs;
}
