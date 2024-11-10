import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

export const __dirname = dirname(fileURLToPath(import.meta.url + '/../'));
export const mode = process.env.MODE || 'production';

export const DEFAULT_WIDTH = 300;
export const DEFAULT_HEIGHT = 200;

export const DEFAULT_BROWSER_WINDOW_OPTIONS = {
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  frame: false,
  alwaysOnTop: true,
  transparent: true,
  skipTaskbar: true,
  resizable: true,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    enableRemoteModule: false,
  },
};