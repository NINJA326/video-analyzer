const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#070707',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  ipcMain.handle('pick-video', async () => {
    const result = await dialog.showOpenDialog({
      title: 'MP4動画を選択',
      properties: ['openFile'],
      filters: [{ name: 'Video', extensions: ['mp4', 'mov', 'm4v', 'webm'] }]
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('save-file', async (_event, { defaultPath, buffer }) => {
    const result = await dialog.showSaveDialog({ defaultPath });
    if (result.canceled || !result.filePath) return false;
    require('fs').writeFileSync(result.filePath, Buffer.from(buffer));
    return true;
  });

  ipcMain.handle('open-youtube-studio', async () => {
    await shell.openExternal('https://studio.youtube.com/');
    return true;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
