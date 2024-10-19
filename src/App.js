import React, { useEffect, useState } from 'react';
// import { ethers } from 'ethers';
import ContentHashUpdateRow from './ContentHashUpdateRow';
import { IoMdPulse } from 'react-icons/io';

function App() {
  const [provider, setProvider] = useState(null);
  // eslint-disable-next-line
  const [account, setAccount] = useState(null);
  // eslint-disable-next-line
  const [network, setNetwork] = useState('');

  const [contentHashUpdates, setContentHashUpdates] = useState([]);
  const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://apiplatform.eth.ac';

  useEffect(() => {
    let provider;
    const initializeProvider = async () => {
      /*
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.BrowserProvider(window.ethereum);

        const signer = await provider.getSigner();
        setAccount(signer.address);

        const network = await provider.getNetwork();
        setNetwork(network.name);
      }
        */
      setProvider(provider);
    };

    initializeProvider();

    const getContentHashUpdates = async () => {
      const response = await fetch(apiUrl + '/content-hash-updates');
      const result = await response.json();
      setContentHashUpdates(result.contentHashUpdates);
    };

    getContentHashUpdates();

    // Set up an interval to fetch updates every 5 seconds
    const intervalId = setInterval(getContentHashUpdates, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  return (
    <div className="container mx-auto px-4 font-sans">
      <header className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-b-2xl shadow-xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <img src="./logo.svg" alt="Logo" width="80" height="80" />
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  Eth.ac <span className="font-light">Decentralized Web Scanner</span>
                </h1>
                <p className="text-xl text-white mt-2 opacity-80 font-light tracking-wide">Delivering the latest from the Decentralized Web</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <IoMdPulse className="text-white text-3xl animate-pulse" />
              {network && (
                <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-full px-4 py-2 text-sm text-white">
                  <span className="font-medium">Network:</span> {network}
                </div>
              )}
            </div>
          </div>
          {account && (
            <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-full px-4 py-2 text-sm text-white">
              <span className="font-medium">Account:</span> {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          )}
        </div>
      </header>

      <div className="overflow-x-auto mt-8">
        <div className="grid grid-cols-6 md:grid-cols-12 gap-4 bg-gray-100 p-4 rounded-t-lg font-medium text-gray-500 uppercase text-sm">
          <div className="col-span-3">Domain</div>
          <div className="hidden md:block col-span-1">Block #</div>
          <div className="col-span-2">Time Confirmed</div>
          <div className="hidden md:block col-span-5">Content Hash</div>
          <div className="col-span-1">Link</div>
        </div>
        <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
          {contentHashUpdates.map((update) => (
            <ContentHashUpdateRow key={update.id} update={update} provider={provider} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
