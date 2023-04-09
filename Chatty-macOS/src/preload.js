const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system'),
})

contextBridge.exposeInMainWorld('electron', {
    reloadPage: () => ipcRenderer.invoke('reload-page'),
    connectServer: (token) => ipcRenderer.invoke('connect-server', token),
})
