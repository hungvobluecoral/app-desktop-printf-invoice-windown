const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools(); // Bật khi debug
}

// 1. Lấy danh sách máy in
ipcMain.handle('get-printers', async () => {
  return await mainWindow.webContents.getPrintersAsync();
});

// 2. Xử lý in hóa đơn
ipcMain.handle('print-receipt', async (event, { printerName, data }) => {
  return new Promise((resolve, reject) => {
    // Tạo một cửa sổ ẩn để render nội dung in
    let workerWin = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: true, contextIsolation: false }
    });

    // Tạo HTML hóa đơn (ESC/POS style)
    const receiptHtml = `
      <html>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 280px; /* Độ rộng chuẩn máy in K80 (~80mm) */
            margin: 0; padding: 10px; font-size: 12px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .dashed { border-top: 1px dashed black; margin: 5px 0; }
          .flex { display: flex; justify-content: space-between; }
        </style>
        <body>
          <div class="center bold">POS TEST PRINT</div>
          <div class="dashed"></div>
          ${data.items.map(item => `
            <div class="flex">
              <span>${item.name}</span>
              <span>${item.price}</span>
            </div>
          `).join('')}
          <div class="dashed"></div>
          <div class="flex bold">
            <span>TOTAL</span>
            <span>${data.total}</span>
          </div>
          <div class="dashed"></div>
          <div class="center">Thank you!</div>
          <div class="center">${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;

    workerWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHtml)}`);

    workerWin.webContents.on('did-finish-load', () => {
      workerWin.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: printerName,
      }, (success, failureReason) => {
        workerWin.destroy();
        if (success) resolve({ status: 'success' });
        else reject({ status: 'error', message: failureReason });
      });
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});