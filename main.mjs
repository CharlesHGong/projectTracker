import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { handleRequest } from './server/api.mjs';
import { DEFAULT_BROWSER_WINDOW_OPTIONS, mode } from './server/constants.mjs';
import { createWindowsTray } from './server/tray.mjs';

let mainWindow;

// Check if another instance of the app is already running
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If another instance is already running, quit the new instance
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('ready', () => {
    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
      ...DEFAULT_BROWSER_WINDOW_OPTIONS,
      x: screenWidth - 300,  // Position the window at the top right corner
      y: 0,                  // Top of the screen
    });

    if (mode === 'production') {
      mainWindow.loadFile('dist/index.html');
      mainWindow.on('ready-to-show', () => {
        mainWindow.show();
      });
    } else {
      mainWindow.loadURL('http://localhost:3000'); // Load from dev server for hot reload
    }

    if (process.platform !== 'darwin') {
      createWindowsTray(mainWindow);
    }

    // Handle message from renderer
    ipcMain.on('request', async (event, data) => {
      console.log('Received message from renderer:', data);
      const response = await handleRequest(data, mainWindow);
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
}

