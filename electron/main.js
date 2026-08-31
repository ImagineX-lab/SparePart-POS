const { app, BrowserWindow, Menu, shell, ipcMain, webContents } = require('electron');
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

// ── Silent thermal print ────────────────────────────────────────────────────
// The renderer sends 'print-receipt-html' with the full HTML string of the
// receipt.  We spin up a hidden BrowserWindow, load that HTML, wait for it
// to finish painting, then fire webContents.print() with silent:true so
// Windows never shows a dialog.  The window is destroyed afterwards.


ipcMain.handle('get-printers', async (event) => {
  try {
    const list = await event.sender.getPrintersAsync();
    return list.map(p => p.name);
  } catch (e) {
    return [];
  }
});

ipcMain.on('print-receipt-html', (event, htmlContent) => {
  // Create a hidden off-screen window to host the receipt HTML
  const printWin = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Load the receipt HTML as a data URL so it has no cross-origin restrictions
  const encoded = Buffer.from(htmlContent, 'utf8').toString('base64');
  printWin.loadURL(`data:text/html;base64,${encoded}`);

  printWin.webContents.once('did-finish-load', () => {
    // Log available printers to the console for debugging
    printWin.webContents.getPrintersAsync().then(printers => {
      console.log('[print] Available printers:', printers.map(p => p.name));
    }).catch(err => {
      console.error('[print] Error getting printers:', err);
    });

    const printOptions = {
      silent: true,          // MUST BE TRUE for thermal printers to avoid 'invalid printer settings'
      printBackground: true
      // deviceName is omitted to avoid enumeration errors if empty
    };

    if (!printOptions.silent) {
      printWin.show();
    }

    printWin.webContents.print(printOptions, (success, errorType) => {
      if (!success) {
        console.error('[print] Silent Print Failed:', errorType);
        event.sender.send('print-result', { success: false, errorType });
      } else {
        console.log('[print] Job dispatched successfully.');
        event.sender.send('print-result', { success: true });
      }
      printWin.destroy();
    });
  });

  // Safety: destroy the window if it takes too long (e.g. driver stall)
  setTimeout(() => {
    if (!printWin.isDestroyed()) {
      console.warn('[print] Timed out waiting for receipt window — destroying.');
      printWin.destroy();
    }
  }, 15000);
});

// Legacy handler kept for backward compatibility (no-op redirect)
ipcMain.on('print-requested', (event) => {
  // Forward to the silent path using the current page HTML
  event.sender.executeJavaScript(
    'document.getElementById("print-area")?.innerHTML || ""'
  ).then(html => {
    if (html) event.sender.send('trigger-print-with-html', html);
  }).catch(() => {});
});
