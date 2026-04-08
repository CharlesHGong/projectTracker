import path from 'path';
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

const getDbPath = () => path.join(app.getPath('appData'), APP_NAME, 'db.json');
let dbPromise = null;
let dbAccessQueue = Promise.resolve();

const getDb = async () => {
  if (!dbPromise) {
    const dbPath = getDbPath();
    console.log('db location', dbPath);
    dbPromise = (async () => {
      const db = await JSONFilePreset(dbPath, defaultDb);
      await db.read();
      db.data.projects = db.data.projects.map(normalizeProject);
      db.data.displayingProjectNames = db.data.displayingProjectNames ?? [];
      return db;
    })();
  }
  return dbPromise;
};

const withDb = (handler) => {
  const next = dbAccessQueue.then(async () => {
    const db = await getDb();
    return handler(db);
  });
  dbAccessQueue = next.catch(() => {});
  return next;
};

const withDbWrite = (handler) =>
  withDb(async (db) => {
    const result = await handler(db);
    await db.write();
    return result;
  });

export const createProject = async (name) => {
  return withDbWrite((db) => {
    db.data.projects.push({ name, code: '', logs: [] });
  });
};

export const addLog = async ({ name, log }) => {
  return withDbWrite(async (db) => {
    const project = db.data.projects.find((project) => project.name === name);
    project.logs.push(log);
    project.logs.sort((a, b) => a.startTime - b.startTime);
  });
};

export const getProjects = async ({ projectNames, range }) => {
  return withDb(async (db) => {
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
    return projectNames
      .map((name) => unOrderedProjects.find((project) => project.name === name))
      .filter(Boolean);
  });
};

export const getProject = async (name) => {
  return withDb(async (db) => {
    const project = db.data.projects.find((item) => item.name === name);
    return project ? normalizeProject(project) : undefined;
  });
};

export const updateProject = async ({ name, project }) => {
  return withDbWrite((db) => {
    const nextName = project.name;
    db.data.projects = db.data.projects.map((p) =>
      p.name === name ? normalizeProject({ ...p, ...project }) : normalizeProject(p)
    );
    if (nextName && nextName !== name) {
      db.data.displayingProjectNames = db.data.displayingProjectNames.map(
        (projectName) => (projectName === name ? nextName : projectName)
      );
    }
  });
};

export const deleteProject = async (name) => {
  return withDbWrite((db) => {
    db.data.projects = db.data.projects.filter((project) => project.name !== name);
    db.data.displayingProjectNames = db.data.displayingProjectNames.filter(
      (projectName) => projectName !== name
    );
  });
};

export const getProjectNames = async () => {
  return withDb(async (db) => {
    const projectNames = db.data.projects.map((project) => project.name);
    const selectedProjectNames = db.data.displayingProjectNames.filter((n) =>
      projectNames.includes(n)
    );
    projectNames.sort();
    return { projectNames, selectedProjectNames };
  });
};

export const updateDisplayingProjectNames = async (selectedProjectNames) => {
  return withDbWrite((db) => {
    db.data.displayingProjectNames = selectedProjectNames;
  });
};

export const getLogsBetweenDates = async ({ startDate, endDate }) => {
  return withDb(async (db) => {
    const logs = db.data.projects.flatMap((project) =>
      normalizeProject(project)
        .logs.filter((log) => log.startTime >= startDate && log.endTime <= endDate)
        .map((log) => ({
          ...log,
          projectName: project.name,
          projectCode: project.code ?? '',
        }))
    );
    return logs;
  });
};
