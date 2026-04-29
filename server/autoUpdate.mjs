import electronUpdater from 'electron-updater';
import electron from 'electron';

const { app, dialog } = electron;

export const setupAutoUpdates = (mainWindow) => {
  if (!app.isPackaged) {
    return;
  }

  const { autoUpdater } = electronUpdater;

  autoUpdater.autoDownload = true;

  autoUpdater.on('error', (error) => {
    console.error('Auto update error:', error);
  });

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for app updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('App is up to date:', info.version);
  });

  autoUpdater.on('update-downloaded', async (info) => {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update ready',
      message: `Project Time Tracker ${info.version} is ready to install.`,
      detail: 'Restart the app to finish updating.',
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.checkForUpdates().catch((error) => {
    console.error('Failed to check for updates:', error);
  });
};
