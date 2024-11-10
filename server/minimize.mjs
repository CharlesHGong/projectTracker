import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "./constants.mjs";

let windowHeight = DEFAULT_HEIGHT;
let windowWidth = DEFAULT_WIDTH;
let windowX = 0;
let windowY = 0;
export const minimize = (mainWindow, payload) => {
  if (payload) {
    windowWidth = mainWindow.getContentSize()[0];
    windowHeight = mainWindow.getContentSize()[1];
    const { x, y } = mainWindow.getContentBounds();
    windowX = x;
    windowY = y;
    mainWindow.setBounds({ x: x + windowWidth - DEFAULT_WIDTH, y, width: DEFAULT_WIDTH, height: 40 });
  } else {
    mainWindow.setBounds({ x: windowX, y: windowY, width: windowWidth, height: windowHeight });
  }
  return
}