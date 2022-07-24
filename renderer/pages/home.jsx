import React, {useState, useEffect} from 'react';
import electron from 'electron';
import Head from 'next/head';
import Link from 'next/link';

import s from './home.module.css';

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
  const [message, setMessage] = useState('no ipc message');
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [networks, setNetworks] = useState(null);

  const onClickWithIpc = () => {
    ipcRenderer.send('ping-pong', 'some data from ipcRenderer');
  };

  const onClickWithNetwork = () => {
    const currentWifi = ipcRenderer.sendSync('wifi-sync');
    console.log(currentWifi);
    setCurrentNetwork(currentWifi.currentNetwork[0]);
    setNetworks(currentWifi.availableNetworks);
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

        <button onClick={onClickWithIpc}>IPC messaging</button>
        <button onClick={onClickWithIpcSync}>IPC messaging (sync)</button>
        <button onClick={onClickWithNetwork}>{currentNetwork ? currentNetwork.ssid : "Get current network"}</button>
        <p>{message}</p>

        <h1 className={s.words}>Current Network</h1>
        {currentNetwork ? 
          <div className={s.network}>
            <p className={s.ssid}>{currentNetwork.ssid}</p>
            <p>{currentNetwork.channel}</p>
            <p>{currentNetwork.signal_level}</p>
            <p>{currentNetwork.security}</p>
            <p>{currentNetwork.quality}</p>
            <p>{currentNetwork.frequency}</p>
          </div>
        : <p>No current network</p>}
       
        <h1 className={s.words}>Available Networks</h1>

        {networks ?
        <div className={s.networks}>
          {networks.map(network => (
              <div key={network.ssid} className={s.network}>
                <p className={s.ssid}>{network.ssid}</p>
                <p>{network.channel}</p>
                <p>{network.signal_level}</p>
                <p>{network.security}</p>
                <p>{network.quality}</p>
                <p>{network.frequency}</p>
              </div>
          ))}
          </div>
        : <p>No networks</p>}
        </div>
    </React.Fragment>
  );
};

export default Home;
