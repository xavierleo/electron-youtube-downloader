const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { downloadVideo, getInfo } = require('./downloader')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 760,
    minHeight: 560,
    title: 'YouTube Downloader',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.handle('downloader:get-info', async (_event, url) => {
  return getInfo(url)
})

ipcMain.handle('downloader:download', async (event, options) => {
  const subprocess = downloadVideo({
    ...options,
    onProgress: progress => {
      event.sender.send('downloader:progress', progress)
    }
  })

  await subprocess
  event.sender.send('downloader:progress', {
    percent: 100,
    message: 'Download complete'
  })

  return { ok: true }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
