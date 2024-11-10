import {
  createProject, addLog,
  getProjectNames, getProjects, updateDisplayingProjectNames,
  getProject, updateProject, deleteProject
} from './db.mjs';
import { exportLogs } from './exportLogs.mjs'

export const handleRequest = async (data, mainWindow) => {
  const { method, payload, id } = data;
  const response = await getResponse(method, payload, mainWindow);
  return { id, data: response };
}

let windowHeight = 200;
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
      if (payload) {
        windowHeight = mainWindow.getContentSize()[1];
        mainWindow.setContentSize(mainWindow.getContentSize()[0], 40);
      } else {
        mainWindow.setContentSize(mainWindow.getContentSize()[0], windowHeight ?? 200);
      }
      return;
    default:
      return 'Invalid method';
  }
}