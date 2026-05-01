const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('downloader', {
  getInfo: url => ipcRenderer.invoke('downloader:get-info', url),
  download: options => ipcRenderer.invoke('downloader:download', options),
  onProgress: callback => {
    const listener = (_event, progress) => callback(progress)
    ipcRenderer.on('downloader:progress', listener)
    return () => ipcRenderer.removeListener('downloader:progress', listener)
  }
})
