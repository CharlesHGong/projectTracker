import { v4 as uuidv4 } from "uuid";
import { Log, MinimizeVariant, Project, TimeRangeOption } from "./types";

declare global {
  interface Window {
    electronAPI: {
      sendMessage: (channel: string, data: any) => void;
      receiveMessage: (channel: string, func: (response: any) => void) => void;
    };
  }
}

// Define the argument and return type mappings
type RequestArgs =
  | { method: "createProject"; payload: string }
  | { method: "addLog"; payload: { name: string; log: Log } }
  | {
      method: "getProjects";
      payload: { projectNames: string[]; range: TimeRangeOption };
    }
  | { method: "getProject"; payload: string }
  | {
      method: "updateProject";
      payload: { name: string; project: Partial<Project> };
    }
  | { method: "deleteProject"; payload: string }
  | { method: "getProjectNames"; payload: undefined }
  | { method: "updateDisplayingProjectNames"; payload: string[] }
  | {
      method: "exportLogs";
      payload: { type: string; startTime: number; endTime: number };
    }
  | {
      method: "minimize";
      payload: { minimized: boolean; variant: MinimizeVariant };
    };

// Define the return types associated with each method
type RequestReturnType<T extends RequestArgs["method"]> =
  T extends "createProject"
    ? Promise<void>
    : T extends "addLog"
    ? Promise<void>
    : T extends "getProjects"
    ? Promise<Project[]>
    : T extends "getProject"
    ? Promise<Project>
    : T extends "updateProject"
    ? Promise<void>
    : T extends "deleteProject"
    ? Promise<void>
    : T extends "getProjectNames"
    ? Promise<{ projectNames: string[]; selectedProjectNames: string[] }>
    : T extends "updateDisplayingProjectNames"
    ? Promise<void>
    : T extends "exportLogs"
    ? Promise<void>
    : T extends "minimize"
    ? Promise<void>
    : never;

const makeWorkerApi = () => {
  let pendingRequests: Record<string, any> = {};

  const request = <T extends RequestArgs["method"]>(
    args: Extract<RequestArgs, { method: T }>
  ): RequestReturnType<T> => {
    const { method, payload } = args;
    const id = uuidv4();
    window.electronAPI.sendMessage("request", { id, method, payload });
    return new Promise((resolve, reject) => {
      pendingRequests[id] = { resolve, reject };
    }) as RequestReturnType<T>;
  };

  window.electronAPI?.receiveMessage("response", (response) => {
    const { id, data } = response;
    const { resolve, reject } = pendingRequests[id] ?? {
      resolve: undefined,
      reject: undefined,
    };
    delete pendingRequests[id];
    resolve?.(data);
  });

  return { request };
};

export const { request } = makeWorkerApi();
