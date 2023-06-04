const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
app.setAppUserModelId('Chatty');
const path = require('path');
const electron = require("electron");
const io = require('socket.io-client');
const { Notification } = require('electron')


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
let createWindow;

if (process.platform === 'darwin') {
  createWindow = () => {
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

    mainWindow.setMinimumSize(865, 545);

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'Pages/Login/login.html'));


    const app = electron.app;
    const icon = electron.nativeImage.createFromPath(app.getAppPath() + "/src/Images/Icons/icon.png");
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


    ipcMain.handle('connect-server', (event, username, server) =>{
      let socket;
        socket = io('http://' + server, {
          query: {username: username}
        });

        socket.on('message', ({from, text, filename}) => {
          let location = mainWindow.webContents.getURL()
          let lastIndex = location.lastIndexOf('html')
          location = location.slice(lastIndex - 5, lastIndex - 1)
          if (location === 'chat') {
            mainWindow.webContents.send('message', text, from, filename)
          } else {
            mainWindow.webContents.send('message-out', from)
            new Notification({
              title: from,
              body: text
            }).show()
          }
          console.log(`Received message from ${from}: ${text}`);
        });
    })
    ipcMain.handle('logout', () =>{
        app.relaunch();
        app.exit();
    });
    };
}















else {
  createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 930,
      height: 650,
      titleBarStyle: 'visible',
      autoHideMenuBar: true,
      icon: path.join(__dirname, 'Images/icon.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'Pages/Login/login.html'));
    const app = electron.app;
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

    ipcMain.handle('connect-server', (event, username, server, mode) =>{
      let socket;
      if (mode === 'connect'){
         socket = io('http://' + server, {
          query: { username: username }
        });
      }
      if (mode === 'disconnect'){
        socket.disconnect()
      }
// Listen for incoming messages
      socket.on('message', ({ from, text, filename }) => {
        let location = mainWindow.webContents.getURL()
        let lastIndex = location.lastIndexOf('html')
        location = location.slice(lastIndex - 5, lastIndex -1)
        if (location === 'chat'){
          mainWindow.webContents.send('message', text, from, filename)
        }
        else{
          mainWindow.webContents.send('message-out', from)
          const iconPath = path.join(__dirname, 'Images/Icons/icon.ico');
          new Notification({
            title: from,
            body: text,
            icon: iconPath
          }).show()
        }
        console.log(`Received message from ${from}: ${text}`);
      });

    })
  };
}

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
