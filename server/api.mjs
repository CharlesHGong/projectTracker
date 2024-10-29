import { createProject, addLog, getProjectNames, getProjects } from './db.mjs';

export const handleRequest = (data) => {
  const { method, payload } = data;
  switch (method) {
    case 'createProject':
      return createProject(payload);
    case 'addLog':
      return addLog(payload);
    case 'getProjects':
      return getProjects(payload);
    case 'getProjectNames':
      return getProjectNames();
    default:
      return 'Invalid method';
  }
}
