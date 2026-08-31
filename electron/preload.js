const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Fire-and-forget: sends the receipt HTML to the main process which
   * prints it silently (no dialog) on the XP-80 / default printer.
   * @param {string} html - Full HTML document string for the receipt
   */
  printReceiptHtml: (html) => ipcRenderer.send('print-receipt-html', html),

  /**
   * Subscribe to the print result event (success / failure toast).
   * @param {function} cb - Callback({ success: bool, errorType?: string })
   * @returns {function} Unsubscribe function
   */
  onPrintResult: (cb) => {
    const handler = (_event, result) => cb(result);
    ipcRenderer.on('print-result', handler);
    return () => ipcRenderer.removeListener('print-result', handler);
  },

  /**
   * Returns a list of installed printer names (for diagnostics / settings UI).
   * @returns {Promise<string[]>}
   */
  getPrinters: () => ipcRenderer.invoke('get-printers'),

  // Legacy shim – kept so any existing callers don't break
  print: () => ipcRenderer.send('print-requested')
});
