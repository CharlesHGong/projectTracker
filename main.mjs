import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { dirname } from 'path';
import { handleRequest } from './server/api.mjs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use electron-reload to watch for changes in Electron files
// electronReload(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//   awaitWriteFinish: true,
// });

let mainWindow;
console.log('path', path.join(__dirname, 'preload.js'));
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 200,
    height: 200,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    skipTaskbar: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,                       // Enable context isolation for security
      enableRemoteModule: false,
    },
  });

  // mainWindow.loadFile('public/index.html');
  // mainWindow.on('ready-to-show', () => {
  //   mainWindow.show();
  // });
  mainWindow.loadURL('http://localhost:3000'); // Load from dev server for hot reload

  // Handle message from renderer
  ipcMain.on('request', async (event, data) => {
    console.log('Received message from renderer:', data);
    const response = await handleRequest(data);
    console.log('response from renderer:', response);
    mainWindow.webContents.send('response', response);
  });
});
