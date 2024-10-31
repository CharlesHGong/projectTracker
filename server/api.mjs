import {
  createProject, addLog,
  getProjectNames, getProjects, updateDisplayingProjectNames,
  getProject, updateProject
} from './db.mjs';
import { exportLogs } from './exportLogs.mjs'

export const handleRequest = async (data) => {
  const { method, payload, id } = data;
  const response = await getResponse(method, payload);
  return { id, data: response };
}

const getResponse = (method, payload) => {
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
    case 'getProjectNames':
      return getProjectNames();
    case 'updateDisplayingProjectNames':
      return updateDisplayingProjectNames(payload);
    case 'exportLogs':
      return exportLogs();
    default:
      return 'Invalid method';
  }
}