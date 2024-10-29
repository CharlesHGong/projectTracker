const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe `send` function to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  receiveMessage: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args))
});
