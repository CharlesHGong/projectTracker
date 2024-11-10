import { Menu, Tray } from "electron";
import path from 'path';
import { __dirname } from './constants.mjs';

let tray = null;
export const createWindowsTray = (mainWindow) => {
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
}