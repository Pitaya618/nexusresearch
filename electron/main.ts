import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { runMigrations } from './db/migrations';
import { closeDb } from './db/connection';
import { registerIpcHandlers } from './ipc-handlers';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  runMigrations();
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  closeDb();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
