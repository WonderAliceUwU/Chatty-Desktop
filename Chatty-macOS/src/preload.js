const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system'),
})

contextBridge.exposeInMainWorld('electron', {
    sendServer: (username) => ipcRenderer.invoke('send-server', username),
    receiveServer: () => ipcRenderer.invoke('receive-server'),
})
