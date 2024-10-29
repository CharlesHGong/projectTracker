import { app, BrowserWindow, ipcMain, screen, Tray, Menu } from 'electron';
import path from 'path';
import { dirname } from 'path';
import { handleRequest } from './server/api.mjs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
let tray = null;

// Use electron-reload to watch for changes in Electron files
// electronReload(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//   awaitWriteFinish: true,
// });

let mainWindow;
app.on('ready', () => {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    x: screenWidth - 300,  // Position the window at the top right corner
    y: 0,                  // Top of the screen
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

  mainWindow.loadFile('public/index.html');
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
  // mainWindow.loadURL('http://localhost:3000'); // Load from dev server for hot reload

  // Create the Tray icon
  tray = new Tray(path.join(__dirname, 'public/icon.png')); // Use a path to your tray icon
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { label: 'Hide', click: () => mainWindow.hide() },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Project Time Tracker');
  tray.setContextMenu(contextMenu);

  // Show the window when the tray icon is clicked
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  // Handle message from renderer
  ipcMain.on('request', async (event, data) => {
    console.log('Received message from renderer:', data);
    const response = await handleRequest(data);
    console.log('response from renderer:', response);
    mainWindow.webContents.send('response', response);
  });
});

app.on('window-all-closed', () => {
  // On macOS, it's common for applications to stay active until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, recreate a window when the app is clicked in the dock if no windows are open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});