const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const http = require('http');
const path = require('path');

let mainWindow;

// Make sure only one copy of the app (and one server/DB) runs at a time.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Starts the same Express app used by `node server.js`, but on an
// OS-assigned local port (127.0.0.1 only, never exposed on the network),
// and returns that port once it's listening.
function startServer() {
  return new Promise((resolve, reject) => {
    const { createApp } = require('../server');
    const expressApp = createApp();
    const server = http.createServer(expressApp);
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
  });
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1000,
    minHeight: 650,
    backgroundColor: '#EAE6DD',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  // Open any external links (e.g. Google Fonts preconnects don't navigate,
  // but just in case a target=_blank link is ever added) in the OS browser
  // instead of a new Electron window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  buildMenu();
  try {
    const port = await startServer();
    createWindow(port);
  } catch (err) {
    console.error('Failed to start the local server:', err);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startServer().then(createWindow);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Listen for print request from renderer process
ipcMain.on('print-requested', (event) => {
  const webContents = event.sender;
  webContents.print({
    silent: false,
    printBackground: true
  }, (success, errorType) => {
    if (!success) console.error('Failed to print receipt:', errorType);
  });
});
