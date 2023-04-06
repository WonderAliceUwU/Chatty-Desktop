const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const net = require('net');
const electron = require("electron");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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


  // Connect to the server on port 3000
  const client = net.createConnection({ port: 3000 }, () => {
    console.log('Connected to server');
  });

  ipcMain.handle('send-server', (event, username) =>{
    client.write(username);
  })

  ipcMain.handle('receive-server', (event) =>{
    client.on('data', (data) => {
      return data.toString()
    });
  })

// When data is received from the server, log it to the console
  client.on('data', (data) => {
    console.log(`Received message from server: ${data.toString()}`);
  });

// When the connection is closed, log a message
  client.on('end', () => {
    console.log('Disconnected from server');
  });
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
