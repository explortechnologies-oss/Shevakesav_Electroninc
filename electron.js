const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = require('electron-is-dev');

// Keep a global reference of the window object
let mainWindow;
let serverProcess;

// Disable security warnings and auto updater messages
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');

function startServer() {
  console.log('Starting SHIVAKESAV ELECTRONICS server...');
  
  // Check if we're on Windows
  const isWindows = process.platform === 'win32';
  const npmCommand = isWindows ? 'npm.cmd' : 'npm';
  
  // Start the server process
  serverProcess = spawn(npmCommand, ['run', 'dev'], {
    stdio: 'pipe',
    cwd: __dirname,
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      PORT: '5000'
    },
    shell: isWindows
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.log(`Server Info: ${data.toString().trim()}`);
  });

  serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
  });
}

function createWindow() {
  console.log('Creating SHIVAKESAV ELECTRONICS window...');
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow loading from localhost
      allowRunningInsecureContent: true
    },
    title: 'SHIVAKESAV ELECTRONICS - Service Management System',
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets/icon.ico') // Optional icon
  });

  // Start with loading screen
  const loadingHTML = `
    <html>
      <head>
        <title>SHIVAKESAV ELECTRONICS</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
          }
          .logo { font-size: 2.5em; margin-bottom: 20px; font-weight: bold; }
          .loading { font-size: 1.2em; margin: 20px 0; }
          .spinner { 
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="logo">📱 SHIVAKESAV ELECTRONICS</div>
        <div class="loading">Service Management System</div>
        <div class="spinner"></div>
        <p>Starting server and loading application...</p>
        <p>Dr. No 29-14-62, Governorpet, Vijayawada</p>
      </body>
    </html>
  `;

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);
  mainWindow.show();

  // Start the server
  startServer();

  // Try to connect to the application after server starts
  let retryCount = 0;
  const maxRetries = 12; // Try for 60 seconds
  
  const checkServer = () => {
    retryCount++;
    console.log(`Attempting to connect to application... (${retryCount}/${maxRetries})`);
    
    mainWindow.loadURL('http://localhost:5000').then(() => {
      console.log('SHIVAKESAV ELECTRONICS application loaded successfully!');
    }).catch((error) => {
      console.log(`Connection attempt ${retryCount} failed:`, error.message);
      
      if (retryCount < maxRetries) {
        setTimeout(checkServer, 5000); // Retry every 5 seconds
      } else {
        console.error('Failed to connect to server after maximum retries');
        // Show error page
        const errorHTML = `
          <html>
            <body style="font-family:Arial;text-align:center;padding:50px;background:#ffebee;">
              <h1 style="color:#d32f2f;">🚫 Connection Error</h1>
              <h2>SHIVAKESAV ELECTRONICS</h2>
              <p>Could not connect to the application server.</p>
              <p>Please check:</p>
              <ul style="text-align:left;max-width:400px;margin:0 auto;">
                <li>MySQL database is running</li>
                <li>Database connection is configured in .env file</li>
                <li>Port 5000 is available</li>
              </ul>
              <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;font-size:16px;">Retry</button>
            </body>
          </html>
        `;
        mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`);
      }
    });
  };

  // Start checking after 3 seconds
  setTimeout(checkServer, 3000);

  // Handle window closed
  mainWindow.on('closed', function () {
    mainWindow = null;
    if (serverProcess) {
      console.log('Stopping server...');
      serverProcess.kill();
    }
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('Electron is ready - starting SHIVAKESAV ELECTRONICS...');
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// Handle app termination
app.on('before-quit', (event) => {
  if (serverProcess) {
    console.log('Terminating server before quit...');
    serverProcess.kill();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors (for localhost)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('http://localhost:')) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});