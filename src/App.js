import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { createClient, cacheExchange, fetchExchange } from '@urql/core'
import { Buffer } from 'buffer';
import ContentHashUpdateRow from './ContentHashUpdateRow';
import { IoMdPulse } from 'react-icons/io';

function App() {
  const [provider, setProvider] = useState(null);
  // eslint-disable-next-line
  const [account, setAccount] = useState(null);
  // eslint-disable-next-line
  const [network, setNetwork] = useState('');
  const [contentHashUpdates, setContentHashUpdates] = useState([]);

  const QueryURL = "https://gateway.thegraph.com/api/06247ef00bd2618d3e77e801651d47ad/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH";

  const contentHashHexToString = (data) => {
    const ipfs = data.match(/^0x(e3010170|e5010172)(([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f]*))$/);
    if (ipfs) {
      const scheme = (ipfs[1] === "e3010170") ? "ipfs" : "ipns";
      const length = parseInt(ipfs[4], 16);
      if (ipfs[5].length === length * 2) {
        return `${scheme}://${ethers.encodeBase58(Buffer.from(ipfs[2], 'hex'))}`;
      }
    }

    // Swarm (CID: 1, Type: swarm-manifest; hash/length hard-coded to keccak256/32)
    const swarm = data.match(/^0xe40101fa011b20([0-9a-f]*)$/)
    if (swarm && swarm[1].length === 64) {
      return `bzz://${swarm[1]}`;
    }
  }

  useEffect(() => {
    const client = createClient({
      url: QueryURL,
      exchanges: [cacheExchange, fetchExchange],
    });

    const contentHashUpdateQuery = `{
      contenthashChangeds(
        where: { hash_not: "0x" },
        orderBy: blockNumber, 
        orderDirection: desc, 
        first: 100
      ) {
        id
        resolver {
          id,
          domain {
            id,
            name
          }
        }
        blockNumber
        transactionID
        hash
      }
    }`;

    let provider = new ethers.JsonRpcProvider('https://sleek-cool-paper.quiknode.pro/b25a8c99595287e5d8c4f84eed1ea8fc4d3ca95f', null, { staticNetwork: ethers.Network.from(1) });
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
      const result = await client.query(contentHashUpdateQuery).toPromise();
      const thisContentHashUpdates = [];

      for (let i = 0; i < result.data?.contenthashChangeds.length; i++) {
        const contenthashChanged = result.data?.contenthashChangeds[i];
        const thisContentHashUpdate = {
          id: contenthashChanged.id,
          resolverID: contenthashChanged.resolver.id,
          domain: contenthashChanged.resolver.domain.name,
          blockNumber: contenthashChanged.blockNumber,
          transactionID: contenthashChanged.transactionID,
          hashHex: contenthashChanged.hash,
          hashString: contentHashHexToString(contenthashChanged.hash)
        };

        if (thisContentHashUpdate.hashString && thisContentHashUpdate.domain.match(/^[a-zA-Z0-9]+.eth$/)) {
          thisContentHashUpdates.push(thisContentHashUpdate);
        }
        // console.log(thisContentHashUpdate);
      };
      setContentHashUpdates(thisContentHashUpdates);
    };

    getContentHashUpdates();

    // Set up an interval to fetch updates every 5 minutes
    const intervalId = setInterval(getContentHashUpdates, 300000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

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
