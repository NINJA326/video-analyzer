const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ninjaDesktop', {
  pickVideo: () => ipcRenderer.invoke('pick-video'),
  saveFile: (defaultPath, arrayBuffer) =>
    ipcRenderer.invoke('save-file', {
      defaultPath,
      buffer: Array.from(new Uint8Array(arrayBuffer))
    }),
  openYouTubeStudio: () => ipcRenderer.invoke('open-youtube-studio'),
  getVersion: () => ipcRenderer.invoke('app-version')
});
