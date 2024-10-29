import { createProject, addLog, getProjectNames, getProjects } from './db.mjs';

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
    case 'getProjectNames':
      return getProjectNames();
    default:
      return 'Invalid method';
  }
}