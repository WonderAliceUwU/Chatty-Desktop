const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const net = require('net');
const electron = require("electron");
const WebSocket = require('websocket').w3cwebsocket;
const io = require('socket.io-client');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 930,
    height: 650,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'src/Images/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'Pages/Login/login.html'));


  const app = electron.app;
  const icon = electron.nativeImage.createFromPath(app.getAppPath() + "/src/Images/icon.png");
  app.dock.setIcon(icon);

  //toggle that detects if dark mode is enabled in the system, changing the scheme colors
  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })

  ipcMain.handle('reload-page', () => {
    BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache()
  })

  ipcMain.handle('connect-server', (event, username) =>{
    const socket = io('http://localhost:3000', {
      query: { username: username }
    });

// Listen for incoming messages
    socket.on('message', ({ from, text }) => {
      let location = mainWindow.webContents.getURL()
      let lastIndex = location.lastIndexOf('html')
      location = location.slice(lastIndex - 5, lastIndex -1)
      if (location === 'chat'){
        mainWindow.webContents.send('message', text, from)
      }
      else{
        mainWindow.webContents.send('message-out', from)
      }
      console.log(`Received message from ${from}: ${text}`);
    });

  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  //if (process.platform !== 'darwin') {
    app.quit();
 // }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
