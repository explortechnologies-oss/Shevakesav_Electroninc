const { app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {
  console.log('Creating SHIVAKESAV ELECTRONICS test window...');
  
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'SHIVAKESAV ELECTRONICS - Test Window',
    show: true,
    autoHideMenuBar: true
  });

  // Load a simple test page
  const testHTML = `
    <html>
      <head>
        <title>SHIVAKESAV ELECTRONICS Test</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
          }
          .logo { font-size: 2em; margin-bottom: 20px; font-weight: bold; }
          .success { font-size: 1.2em; margin: 20px 0; color: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="logo">📱 SHIVAKESAV ELECTRONICS</div>
        <div class="success">✅ Electron Desktop App Test Successful!</div>
        <p>Service Management System</p>
        <p>Dr. No 29-14-62, Governorpet, Vijayawada</p>
        <p>Ph: 9182193469, 9642365559</p>
        <br>
        <p style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
          If you can see this window, Electron is working correctly!<br>
          The main application should work too.
        </p>
      </body>
    </html>
  `;

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(testHTML)}`);
  
  console.log('✅ SHIVAKESAV ELECTRONICS test window created successfully!');
  
  mainWindow.on('closed', function () {
    mainWindow = null;
    console.log('Test window closed');
  });
}

app.whenReady().then(() => {
  console.log('🚀 Electron ready - creating SHIVAKESAV ELECTRONICS test window');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});