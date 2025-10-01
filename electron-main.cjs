const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let serverProcess;

// Start the Express server
function startServer(extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const PORT = (extraEnv.PORT || process.env.PORT || '5000');

    // Helper: check if server is already up
    function checkServerOnce(cb) {
      try {
        const req = http.request({ host: '127.0.0.1', port: Number(PORT), path: '/', timeout: 1500 }, (res) => {
          res.resume();
          cb(true);
        });
        req.on('error', () => cb(false));
        req.on('timeout', () => { try { req.destroy(); } catch {} cb(false); });
        req.end();
      } catch {
        cb(false);
      }
    }

    // First, if something is already listening, just continue
    checkServerOnce((up) => {
      if (up) {
        console.log(`Server already running on port ${PORT}. Skipping spawn.`);
        return resolve();
      }

      let serverScript, command, args;

      if (app.isPackaged) {
        // Run the bundled server using Electron as Node
        // Works regardless of EXE name or install location
        serverScript = path.join(process.resourcesPath, 'app.asar', 'dist', 'index.js');
        console.log('[Electron] execPath =', process.execPath);
        console.log('[Electron] resourcesPath =', process.resourcesPath);
        console.log('[Electron] serverScript =', serverScript);
        if (!fs.existsSync(serverScript)) {
          const msg = `Server entry not found at:\n${serverScript}\n\nRebuild with:\n  npm run build:all && npm run dist\n\nEnsure package.json -> build.files includes \"dist/**/*\".`;
          console.error(msg);
          dialog.showErrorBox('Startup error', msg);
        }
        command = process.execPath; // current Electron executable
        args = [serverScript];
      } else {
        // Development: same behavior as before
        serverScript = path.join(__dirname, 'server', 'index.ts');
        const tsxBin = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');
        if (fs.existsSync(tsxBin)) {
          command = tsxBin;
          args = [serverScript];
        } else {
          command = process.execPath;
          args = ['-r', 'tsx', serverScript];
        }
      }

      const childEnv = {
        ...process.env,
        ELECTRON_RUN_AS_NODE: app.isPackaged ? '1' : process.env.ELECTRON_RUN_AS_NODE,
        NODE_ENV: app.isPackaged ? 'local' : (process.env.NODE_ENV || 'development'),
        USE_LOCAL_DB: 'true',
        PORT: String(PORT),
        ...extraEnv,
      };

      const child = spawn(command, args, {
        env: childEnv,
        stdio: 'pipe',
        cwd: app.isPackaged ? path.dirname(process.execPath) : __dirname,
      });
      serverProcess = child;

      let resolved = false;
      const deadline = Date.now() + 30000; // 30s fallback

      function poll() {
        if (resolved) return;
        checkServerOnce((up2) => {
          if (up2) {
            resolved = true;
            return resolve();
          }
          if (Date.now() > deadline) {
            // Give up but allow app to show window; server might come up later
            resolved = true;
            console.warn('Server did not signal readiness within timeout; continuing.');
            return resolve();
          }
          setTimeout(poll, 1000);
        });
      }

      child.stdout.on('data', (data) => {
        const s = data.toString();
        console.log(`Server: ${s}`);
      });

      child.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
      });

      child.on('error', (err) => {
        console.error('Failed to spawn server process:', err);
        if (!resolved) { resolved = true; resolve(); }
      });

      child.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
      });

      // Start polling for readiness
      poll();
    });
  });
}

// ...existing code...
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: isDev ? null : path.join(__dirname, 'build/icon.ico'), // Add your app icon
    show: false, // Don't show until ready
    title: 'SHIVAKESAV ELECTRONICS - Service Management System'
  });

  // Load the app
  const startUrl = 'http://localhost:5000';
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  // Development tools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 1);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 1);
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'SHIVAKESAV ELECTRONICS',
              detail: 'Service Management System v1.0\n\nElectronic Appliance Service & Repair Center\nVijayawada, Andhra Pradesh'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
  try {
    const userDataDir = app.getPath('userData');
    console.log('Starting Express server...');
    await startServer({ USER_DATA_DIR: userDataDir, PORT: '5000' });
    console.log('Server started, creating window...');
    
    createWindow();
    createMenu();
    
    console.log('Desktop application ready!');
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox('Startup Error', 'Failed to start the application server. Please check your database configuration.');
  }
});

app.on('window-all-closed', () => {
  // Kill server process
  if (serverProcess) {
    serverProcess.kill();
  }
  
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app quit
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Security: prevent navigation to external websites
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5000') {
      navigationEvent.preventDefault();
    }
  });
});