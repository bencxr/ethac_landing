import 'dotenv/config';
import { createClient, cacheExchange, fetchExchange } from '@urql/core'
import { ethers } from 'ethers';
import { Buffer } from 'buffer';
import ContentHashUpdates from './models/ContentHashUpdates.js';
import { env } from 'process';

const provider = new ethers.JsonRpcProvider(env.WEB3_RPC_URI, null, { staticNetwork: ethers.Network.from(1) });
const graphClient = createClient({ url: env.GRAPHQL_SUBGRAPH_URI, exchanges: [cacheExchange, fetchExchange] });

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

const getContentHashUpdates = async (numToPoll = env.POLL_SCAN_NUM) => {
    console.log('Polling for', numToPoll, 'updates...');
    const contentHashUpdateQuery = `{
      contenthashChangeds(
        where: { hash_not: "0x" },
        orderBy: blockNumber, 
        orderDirection: desc, 
        first: ${numToPoll}
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
    const result = await graphClient.query(contentHashUpdateQuery).toPromise();

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

        if (thisContentHashUpdate.hashString && thisContentHashUpdate.domain.match(/^[a-zA-Z0-9\.]+.eth$/)) {
            const exists = await ContentHashUpdates.exists({ id: thisContentHashUpdate.id });
            if (exists !== null) {
                // console.log('Already exists:', thisContentHashUpdate.id);
                continue; // already exists, skip
            }

            const block = await provider.getBlock(thisContentHashUpdate.blockNumber);
            thisContentHashUpdate.blockTimestamp = new Date(block.timestamp * 1000);

            try {
                console.log('Creating:', thisContentHashUpdate.id, thisContentHashUpdate.domain, thisContentHashUpdate.hashString);
                await ContentHashUpdates.create(thisContentHashUpdate);
            } catch (error) {
                console.error('Error creating content hash update:', thisContentHashUpdate.id, error.message);
            }
        } else {
            // console.log('Skipping:', thisContentHashUpdate);
        }
    }
}

const main = async () => {
    const exists = await ContentHashUpdates.exists({});
    if (!exists) {
        console.log('Initial scan...', env.INITIAL_SCAN_NUM);
        await getContentHashUpdates(env.INITIAL_SCAN_NUM);
    }

    console.log('Starting to poll for updates every', env.SCAN_INTERVAL_MS, 'ms...');
    setInterval(getContentHashUpdates, env.SCAN_INTERVAL_MS);
}

export const startScanner = () => {
    main();
};

