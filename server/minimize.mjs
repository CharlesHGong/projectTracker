import { app } from "electron";
import fs from "fs";
import path from "path";
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "./constants.mjs";

const MINIMIZED_HEIGHT = 40;
const PROJECT_ROW_HEIGHT = 32;
const PROJECT_LIST_GAP = 4;
const COMPACT_HEIGHT =
  MINIMIZED_HEIGHT + PROJECT_ROW_HEIGHT * 3 + PROJECT_LIST_GAP * 2;
const WINDOW_STATE_FILE_NAME = "window-state.json";

let expandedBounds = {
  x: 0,
  y: 0,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
};
let isWindowMinimized = false;

const getWindowStatePath = () =>
  path.join(app.getPath("userData"), WINDOW_STATE_FILE_NAME);

const sanitizeBounds = (bounds) => {
  if (!bounds || typeof bounds !== "object") {
    return null;
  }

  const width = Number(bounds.width);
  const height = Number(bounds.height);
  const x = Number(bounds.x);
  const y = Number(bounds.y);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  return {
    x: Number.isFinite(x) ? Math.round(x) : 0,
    y: Number.isFinite(y) ? Math.round(y) : 0,
    width: Math.max(200, Math.round(width)),
    height: Math.max(120, Math.round(height)),
  };
};

const persistExpandedBounds = () => {
  const windowStatePath = getWindowStatePath();
  fs.mkdirSync(path.dirname(windowStatePath), { recursive: true });
  fs.writeFileSync(windowStatePath, JSON.stringify(expandedBounds), "utf8");
};

export const loadExpandedBounds = () => {
  try {
    const windowStatePath = getWindowStatePath();
    if (!fs.existsSync(windowStatePath)) {
      return null;
    }
    const nextBounds = sanitizeBounds(
      JSON.parse(fs.readFileSync(windowStatePath, "utf8"))
    );
    if (!nextBounds) {
      return null;
    }
    expandedBounds = nextBounds;
    return expandedBounds;
  } catch {
    return null;
  }
};

export const rememberExpandedBounds = (mainWindow) => {
  if (isWindowMinimized) {
    return;
  }
  const nextBounds = sanitizeBounds(mainWindow.getBounds());
  if (!nextBounds) {
    return;
  }
  expandedBounds = nextBounds;
  persistExpandedBounds();
};

export const minimize = (mainWindow, payload) => {
  const minimized = typeof payload === 'boolean' ? payload : payload?.minimized;
  const variant = typeof payload === 'boolean' ? 'minimize' : payload?.variant;
  const targetHeight = variant === 'compact' ? COMPACT_HEIGHT : MINIMIZED_HEIGHT;

  if (minimized) {
    if (!isWindowMinimized) {
      rememberExpandedBounds(mainWindow);
    }
    isWindowMinimized = true;
    mainWindow.setBounds({
      x: expandedBounds.x,
      y: expandedBounds.y,
      width: expandedBounds.width,
      height: targetHeight,
    });
  } else {
    isWindowMinimized = false;
    mainWindow.setBounds(expandedBounds);
  }
  return
}
