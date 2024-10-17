import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { createClient, cacheExchange, fetchExchange } from '@urql/core'
import { Buffer } from 'buffer';
import ContentHashUpdateRow from './ContentHashUpdateRow';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
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

    let provider;
    const initializeProvider = async () => {
      provider = new ethers.JsonRpcProvider('https://sleek-cool-paper.quiknode.pro/b25a8c99595287e5d8c4f84eed1ea8fc4d3ca95f', null, { staticNetwork: ethers.Network.from(1) });

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
    <div>
      {account && <p>Connected account: {account}</p>}
      {network && <p>Connected to network: {network}</p>}

      <h2>Decentralized Web Updates</h2>
      <table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Block Number</th>
            <th>Block Time</th>
            <th>Hash</th>
          </tr>
        </thead>
        <tbody>
          {contentHashUpdates.map((update) => (
            <ContentHashUpdateRow key={update.id} update={update} provider={provider} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
