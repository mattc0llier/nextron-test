import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
const wifi = require('node-wifi');
import find from 'local-devices'


let currentNetwork = [];
let availableNetworks = [];
let networkDevices = [];

wifi.init({
  iface: null // network interface, choose a random wifi interface if set to null
});

wifi.getCurrentConnections((error, currentConnections) => {
  if (error) {
    console.log(error);
  } else {
    console.log(currentConnections);
    currentNetwork = currentConnections;
  }
});

// Scan networks
wifi.scan((error, networks) => {
  if (error) {
    console.log(error);
  } else {
    console.log(networks);
    availableNetworks = networks;
  }
});

// Find all local network devices.
find().then(devices => {
  console.log('devices', devices) 
  networkDevices = devices;
  
  /*
  [
    { name: '?', ip: '192.168.0.10', mac: '...' },
    { name: '...', ip: '192.168.0.17', mac: '...' },
    { name: '...', ip: '192.168.0.21', mac: '...' },
    { name: '...', ip: '192.168.0.22', mac: '...' }
  ]
  */
})


const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});



ipcMain.on('ping-pong', (event, arg) => {
  event.sender.send('ping-pong', `[ipcMain] "${arg}" received asynchronously.`);
});

ipcMain.on('ping-pong-sync', (event, arg) => {
  event.returnValue = `[ipcMain] "${arg}" received synchronously.`;
});

ipcMain.on('ping-pong', (event, arg) => {
  event.sender.send('ping-pong', `[ipcMain] "${arg}" received asynchronously.`);
});

ipcMain.on('wifi-sync', (event) => {
  console.log('wifi', currentNetwork);
  event.returnValue = {
    currentNetwork: currentNetwork,
    availableNetworks: availableNetworks,
    networkDevices: networkDevices
  }
  // event.sender.send('wifi', currentNetwork);
});
