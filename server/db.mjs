import { JSONFilePreset } from 'lowdb/node';
import { app } from 'electron';

const APP_NAME = 'projectTimeTracker';

const defaultDb = {
  projects: [],
  displayingProjectNames: [],
};
console.log('db location', `${app.getPath('appData')}/${APP_NAME}/db.json`);
const loadDb = async () => {
  const db = await JSONFilePreset(`${app.getPath('appData')}/${APP_NAME}/db.json`, defaultDb);
  db.read();
  return db;
};

export const createProject = async (name) => {
  const db = await loadDb();
  db.data.projects.push({ name, logs: [] });
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

export const getProjects = async (projectNames) => {
  const db = await loadDb();
  return db.data.projects.filter((project) => projectNames.includes(project.name));
}

export const getProjectNames = async () => {
  const db = await loadDb();
  const projectNames = db.data.projects.map((project) => project.name);
  const selectedProjectNames = db.data.displayingProjectNames;
  return { projectNames, selectedProjectNames };
}

export const updateDisplayingProjectNames = async (selectedProjectNames) => {
  const db = await loadDb();
  db.data.displayingProjectNames = selectedProjectNames;
  await db.write();
  return;
}
