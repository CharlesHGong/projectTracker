import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { handleRequest } from './server/api.mjs';
import { setupAutoUpdates } from './server/autoUpdate.mjs';
import { DEFAULT_BROWSER_WINDOW_OPTIONS, mode } from './server/constants.mjs';
import { loadExpandedBounds, rememberExpandedBounds } from './server/minimize.mjs';
import { createWindowsTray } from './server/tray.mjs';

let mainWindow;

const getInitialWindowBounds = () => {
  const savedBounds = loadExpandedBounds();
  const workArea = screen.getPrimaryDisplay().workArea;
  const width = Math.min(
    savedBounds?.width ?? DEFAULT_BROWSER_WINDOW_OPTIONS.width,
    workArea.width
  );
  const height = Math.min(
    savedBounds?.height ?? DEFAULT_BROWSER_WINDOW_OPTIONS.height,
    workArea.height
  );

  const defaultX = workArea.x + workArea.width - width;
  const defaultY = workArea.y;
  const maxX = workArea.x + workArea.width - width;
  const maxY = workArea.y + workArea.height - height;

  return {
    width,
    height,
    x:
      savedBounds && Number.isFinite(savedBounds.x)
        ? Math.max(workArea.x, Math.min(savedBounds.x, maxX))
        : defaultX,
    y:
      savedBounds && Number.isFinite(savedBounds.y)
        ? Math.max(workArea.y, Math.min(savedBounds.y, maxY))
        : defaultY,
  };
};

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
    const initialBounds = getInitialWindowBounds();

    mainWindow = new BrowserWindow({
      ...DEFAULT_BROWSER_WINDOW_OPTIONS,
      ...initialBounds,
    });
    rememberExpandedBounds(mainWindow);

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

    setupAutoUpdates(mainWindow);

    mainWindow.on('resize', () => rememberExpandedBounds(mainWindow));
    mainWindow.on('move', () => rememberExpandedBounds(mainWindow));

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
