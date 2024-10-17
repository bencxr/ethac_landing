import React, { useEffect, useState } from 'react';
import { FaGlobe } from 'react-icons/fa';

function ContentHashUpdateRow({ update, provider }) {
    const [blockDate, setBlockDate] = useState('');
    const [blockTime, setBlockTime] = useState('');

    useEffect(() => {
        const getBlockTime = async () => {
            let tries = 5;
            while (tries > 0) {
                try {
                    const block = await provider.getBlock(update.blockNumber);
                    const date = new Date(block.timestamp * 1000);
                    setBlockDate(date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }));
                    setBlockTime(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
                    return;
                } catch (error) {
                    console.error('Error fetching block time:', error);
                    // Wait for a random time between 0 to 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000));
                }
                tries--;
            }
        };

        getBlockTime();
    }, [update.blockNumber, provider]);

    return (
        <div className="grid grid-cols-6 md:grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white transition-all duration-300">
            <div className="col-span-3 text-sm font-medium text-blue-600 truncate">
                <a href={`https://${update.domain}.ac/`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition-colors duration-300">{update.domain}</a>
            </div>
            <div className="hidden md:block col-span-1 text-sm text-gray-700">{update.blockNumber}</div>
            <div className="col-span-2 text-sm">
                <span className="text-gray-700">{blockDate}</span>{' '}
                <span className="text-gray-500">{blockTime}</span>
            </div>
            <div className="hidden md:block col-span-5 text-sm text-gray-600 break-all">{update.hashString}</div>
            <div className="col-span-1 flex items-center space-x-2">
                <a href={`https://${update.domain}.ac/`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                    <FaGlobe className="h-5 w-5" />
                </a>
                <a href={`https://etherscan.io/tx/${update.transactionID}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293.775 293.671" className="h-5 w-5">
                        <g id="etherscan-logo-circle" transform="translate(-219.378 -213.33)">
                            <path d="M280.433,353.152A12.45,12.45,0,0,1,292.941,340.7l20.737.068a12.467,12.467,0,0,1,12.467,12.467v78.414c2.336-.692,5.332-1.43,8.614-2.2a10.389,10.389,0,0,0,8.009-10.11V322.073a12.469,12.469,0,0,1,12.468-12.47h20.778a12.469,12.469,0,0,1,12.467,12.47v90.276s5.2-2.106,10.269-4.245a10.408,10.408,0,0,0,6.353-9.577V290.9a12.466,12.466,0,0,1,12.466-12.467h20.778A12.468,12.468,0,0,1,450.815,290.9v88.625c18.014-13.055,36.271-28.758,50.759-47.639a20.926,20.926,0,0,0,3.185-19.537,146.6,146.6,0,0,0-136.644-99.006c-81.439-1.094-148.744,65.385-148.736,146.834a146.371,146.371,0,0,0,19.5,73.45,18.56,18.56,0,0,0,17.707,9.173c3.931-.346,8.825-.835,14.643-1.518a10.383,10.383,0,0,0,9.209-10.306V353.152" fill="currentColor" />
                            <path d="M244.417,398.641A146.808,146.808,0,0,0,477.589,279.9c0-3.381-.157-6.724-.383-10.049-53.642,80-152.686,117.4-232.79,128.793" transform="translate(35.564 80.269)" fill="currentColor" opacity="0.5" />
                        </g>
                    </svg>
                </a>
            </div>
        </div>
    );
}

export default ContentHashUpdateRow;
