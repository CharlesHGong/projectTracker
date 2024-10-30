import { v4 as uuidv4 } from "uuid";

const makeWorkerApi = () => {
  let pendingRequests = {};

  const request = ({ method, payload }) => {
    const id = uuidv4();
    window.electronAPI.sendMessage('request', { id, method, payload });
    return new Promise((resolve, reject) => { pendingRequests[id] = { resolve, reject }; });
  }

  window.electronAPI?.receiveMessage('response', (response) => {
    const { id, data } = response;
    const { resolve, reject } = pendingRequests[id] ?? { resolve: undefined, reject: undefined };
    delete pendingRequests[id];
    resolve?.(data);
  });

  return { request };
}

export const { request } = makeWorkerApi();