import {
  createProject, addLog,
  getProjectNames, getProjects, updateDisplayingProjectNames,
  getProject, updateProject, deleteProject
} from './db.mjs';
import { exportLogs } from './exportLogs.mjs'
import { minimize, rememberExpandedBounds } from './minimize.mjs';

export const handleRequest = async (data, mainWindow) => {
  const { method, payload, id } = data;
  if (method !== 'minimize') {
    rememberExpandedBounds(mainWindow);
  }
  const response = await getResponse(method, payload, mainWindow);
  return { id, data: response };
}

const getResponse = (method, payload, mainWindow) => {
  switch (method) {
    case 'createProject':
      return createProject(payload);
    case 'addLog':
      return addLog(payload);
    case 'getProjects':
      return getProjects(payload);
    case 'getProject':
      return getProject(payload);
    case 'updateProject':
      return updateProject(payload);
    case 'deleteProject':
      return deleteProject(payload);
    case 'getProjectNames':
      return getProjectNames();
    case 'updateDisplayingProjectNames':
      return updateDisplayingProjectNames(payload);
    case 'exportLogs':
      return exportLogs(payload);
    case 'minimize':
      return minimize(mainWindow, payload);
    default:
      return 'Invalid method';
  }
}
