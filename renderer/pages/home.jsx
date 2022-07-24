import React, {useState, useEffect} from 'react';
import electron from 'electron';
import Head from 'next/head';
import Link from 'next/link';

import s from './home.module.css';

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
  // const [message, setMessage] = useState('no ipc message');
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [networks, setNetworks] = useState(null);
  const [devices, setDevices] = useState(null);

  const onClickWithIpc = () => {
    ipcRenderer.send('ping-pong', 'some data from ipcRenderer');
  };

  const onClickWithNetwork = () => {
    const currentWifi = ipcRenderer.sendSync('wifi-sync');
    console.log(currentWifi);
    setCurrentNetwork(currentWifi.currentNetwork[0]);
    setNetworks(currentWifi.availableNetworks);
    setDevices(currentWifi.networkDevices);
  };

  const onClickWithIpcSync = () => {
    const message = ipcRenderer.sendSync('ping-pong-sync', 'some data from ipcRenderer');
    setMessage(message);
  };

  // If we use ipcRenderer in this scope, we must check the instance exists
  if (ipcRenderer) {
    // In this scope, the webpack process is the client
  }

  useEffect(() => {
    // like componentDidMount()

    // register `ping-pong` event
    ipcRenderer.on('ping-pong', (event, data) => {
      setMessage(data);
    });

    ipcRenderer.on('wifi-sync', (event, data) => {
      setCurrentNetwork(data);
    });

    return () => {
      // like componentWillUnmount()

      // unregister it
      ipcRenderer.removeAllListeners('ping-pong');
      ipcRenderer.removeAllListeners('wifi-sync');
    };
  }, []);


  console.log('currentNetwork', currentNetwork);

  return (
    <React.Fragment>
      <Head>
        <title>Workstate</title>
      </Head>
      <div>
        <button onClick={onClickWithNetwork}>Get current network</button>

        <h1 className={s.words}>Current Network</h1>
        {currentNetwork ? 
          <div className={s.network}>
            <p className={s.ssid}>{currentNetwork.ssid}</p>
            <p>Channel: {currentNetwork.channel}</p>
            <p>Signal: {currentNetwork.signal_level}</p>
            <p>Security: {currentNetwork.security}</p>
            <p>Quality: {currentNetwork.quality}</p>
            <p>Frequency: {currentNetwork.frequency}</p>
          </div>
        : <p>No current network</p>}
       
        <h1 className={s.words}>Available Networks</h1>

        {networks ?
        <div className={s.networks}>
          {networks.map(network => (
              <div key={network.ssid} className={s.network}>
                <p className={s.ssid}>{network.ssid}</p>
                <p>Channel: {network.channel}</p>
                <p>Signal: {network.signal_level}</p>
                <p>Security: {network.security}</p>
                <p>Quality: {network.quality}</p>
                <p>Frequency: {network.frequency}</p>
              </div>
          ))}
          </div>
        : <p>No networks</p>}

        
        <h1 className={s.words}>Devices on Network</h1>

        {devices ?
        <div className={s.networks}>
          {devices.map(device => (
              <div key={device.mac} className={s.network}>
                <p>{device.name}</p>
                <p>{device.ip}</p>
                <p>{device.mac}</p>
              </div>
          ))}
          </div>
        : <p>No devices</p>} 
        </div>
    </React.Fragment>
  );
};

export default Home;
