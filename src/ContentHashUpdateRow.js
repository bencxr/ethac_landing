import React, { useEffect, useState } from 'react';

function ContentHashUpdateRow({ update, provider }) {
    const [blockTime, setBlockTime] = useState(null);

    useEffect(() => {
        const fetchBlockTime = async () => {
            if (provider) {
                const block = await provider.getBlock(update.blockNumber);
                setBlockTime(new Date(block.timestamp * 1000).toLocaleString());
            }
        };

        fetchBlockTime();
    }, [update.blockNumber, provider]);

    return (
        <tr>
            <td>{update.domain}</td>
            <td>{update.blockNumber}</td>
            <td>{blockTime || 'Loading...'}</td>
            <td>{update.hashString}</td>
        </tr>
    );
}

export default ContentHashUpdateRow;