const printerSelect = document.getElementById('printer-select');
const btnScan = document.getElementById('btn-scan');
const btnPrint = document.getElementById('btn-print');
const statusLog = document.getElementById('status-log');

function log(msg, isError = false) {
  statusLog.innerText = msg;
  statusLog.style.color = isError ? 'red' : 'green';
  console.log(`[PrinterLog] ${msg}`);
}

async function scanPrinters() {
  try {
    log('Scanning printers...');
    const printers = await window.api.getPrinters();
    
    printerSelect.innerHTML = '';
    printers.forEach(p => {
      const option = document.createElement('option');
      option.value = p.name;
      option.text = `${p.name} ${p.isDefault ? '(Mặc định)' : ''}`;
      printerSelect.appendChild(option);
    });

    log(`Tìm thấy ${printers.length} máy in.`);
  } catch (err) {
    log('Lỗi khi quét máy in: ' + err.message, true);
  }
}

async function printTest() {
  const selectedPrinter = printerSelect.value;
  if (!selectedPrinter) return log('Vui lòng chọn máy in!', true);

  const testData = {
    items: [
      { name: 'Item A', price: '10.000' },
      { name: 'Item B', price: '20.000' }
    ],
    total: '30.000'
  };

  try {
    log(`Đang gửi lệnh in tới: ${selectedPrinter}...`);
    const result = await window.api.printReceipt({
      printerName: selectedPrinter,
      data: testData
    });
    log('In thành công!');
  } catch (err) {
    log('In thất bại: ' + JSON.stringify(err), true);
  }
}

btnScan.addEventListener('click', scanPrinters);
btnPrint.addEventListener('click', printTest);

// Tự động quét khi mở app
scanPrinters();