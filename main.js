const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#070707',
    title: 'NINJA Video Analyzer Pro v14.0.0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  ipcMain.handle('pick-video', async () => {
    const result = await dialog.showOpenDialog({
      title: '動画を選択',
      properties: ['openFile'],
      filters: [
        { name: 'Video', extensions: ['mp4', 'mov', 'm4v', 'webm'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('save-file', async (_event, { defaultPath, buffer }) => {
    const result = await dialog.showSaveDialog({ defaultPath });
    if (result.canceled || !result.filePath) return false;
    fs.writeFileSync(result.filePath, Buffer.from(buffer));
    return true;
  });

  ipcMain.handle('open-youtube-studio', async () => {
    await shell.openExternal('https://studio.youtube.com/');
    return true;
  });

  ipcMain.handle('app-version', () => app.getVersion());

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
