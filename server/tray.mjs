import { Menu, Tray, app, screen } from "electron";
import path from 'path';
import { __dirname } from './constants.mjs';
import { DEFAULT_BROWSER_WINDOW_OPTIONS } from './constants.mjs'

let tray = null;
export const createWindowsTray = (mainWindow) => {
  // Create the Tray icon
  tray = new Tray(path.join(__dirname, 'public/icon.png')); // Use a path to your tray icon
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Center', click: () => centerWindow(mainWindow) },
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
}

const centerWindow = (mainWindow) => {
  const windowWidth = DEFAULT_BROWSER_WINDOW_OPTIONS.width;
  const windowHeight = DEFAULT_BROWSER_WINDOW_OPTIONS.height;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize; // Get main screen dimensions
  // Calculate the center position
  const x = Math.round((width - windowWidth) / 2);
  const y = Math.round((height - windowHeight) / 2);

  // Move window to the center of the main screen
  mainWindow.setBounds({
    x,
    y,
    width: windowWidth,
    height: windowHeight,
  });
}