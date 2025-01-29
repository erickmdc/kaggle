import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './utils.js';
import { getPreloadPath } from './pathResolver.js';
import { fetchData } from './resourceManager.js';

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath()
    }
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:3555');
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }

  ipcMain.handle("fetchData", async (_,) => {
    return await fetchData(mainWindow);
  });
});