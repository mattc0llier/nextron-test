import { app, ipcMain, Tray, Menu, nativeImage } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
const wifi = require('node-wifi');
import find from 'local-devices'
const si = require('systeminformation');

const isMac = process.platform === 'darwin'


let currentNetwork = null;
let availableNetworks = [];
let networkDevices = [];
let tray

/////////////

// get network stats once every second

  // const getNetworkStats = () => si.networkInterfaces().then(data => console.log('network stats', data));

  // setInterval(getNetworkStats, 1000);


///

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
    // console.log(networks);
    availableNetworks = networks;
  }
});

// Find all local network devices.
// find().then(devices => {
//   console.log('devices', devices) 
//   networkDevices = devices;
// })

///////

app.whenReady().then(() => {
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEnSURBVHgBnVOBkURAEJy6ugBkQAZkQAhkQAYyIANkIAMyQARCQASIYH976tYv1l/Vd9VU3ezszPZ0HxIa1nUVYRgKIhKO44hxHMU3kJ4URcHNKizL+jrgRRqGYdBT2raNlmWhv3Aa4Pv+qSjXINu2b00YfDx2pYQ1PM9jDaZpulHGGVZDaxzHgkx74RIGmJDn+UknehIHr/R9f+T4HQQBD0agOU1T8wAufF5Q66C56zquw25l8W0AiieKMuq6Fk94XRWW1Dl0mJxQeF8PqqriAbBwnmeS1ClJEmqahvZ9Zwtd1+X6zUYobLJPNh/W0edvru4QxICf+AaevAcgpq5LWZZ8/o6iiKkCUqxfagZtjLlOrW3bJ7GZGVjgPmxW4BXgcZZl4j/4AblXR6FcwAEjAAAAAElFTkSuQmCC')
  tray = new Tray(icon)

  console.log('currentNetwork - tray', currentNetwork)

  const contextMenu = Menu.buildFromTemplate([
    { label: 'My network:', type: 'normal', enabled: true },
    { type: 'separator' },
    { label: currentNetwork ? currentNetwork[0].ssid : 'Finding network', type: 'normal' },
    { type: 'separator' },
    { label: 'Item3', type: 'normal'},
  ])

  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})

////

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
  // console.log('wifi', currentNetwork);
  event.returnValue = {
    currentNetwork: currentNetwork,
    availableNetworks: availableNetworks,
    networkDevices: networkDevices
  }
  // event.sender.send('wifi', currentNetwork);
});
