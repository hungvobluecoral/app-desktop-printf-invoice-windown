const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printReceipt: (payload) => ipcRenderer.invoke('print-receipt', payload)
});