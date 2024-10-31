import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import '../styles/Home.module.css';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ContentHashUpdateRow from '../components/ContentHashUpdateRow';
import { IoMdPulse } from 'react-icons/io';

const Home: NextPage = () => {
  // eslint-disable-next-line
  const [account, setAccount] = useState<string | null>(null);
  // eslint-disable-next-line
  const [network, setNetwork] = useState('');

  const [contentHashUpdates, setContentHashUpdates] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  let apiUrl = 'https://apiplatform.eth.ac';
  if ((typeof window !== "undefined") && window.location.hostname === 'localhost') {
    apiUrl = 'http://localhost:4000';
  }

  const observer = useRef<IntersectionObserver | null>();

  const getContentHashUpdates = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/content-hash-updates?page=${page}&limit=20`);
      const result = await response.json();

      if (result.contentHashUpdates.length === 0) {
        setHasMore(false);
      } else {
        const newUpdates = (prevUpdates: any[]) => {
          const uniqueUpdates = result.contentHashUpdates.filter(
            (update: any) => !prevUpdates.some(prevUpdate => prevUpdate.id === update.id)
          );
          return [...prevUpdates, ...uniqueUpdates];
        }
        setContentHashUpdates(newUpdates);
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error('Error fetching content hash updates:', error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, page, loading, hasMore]);

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        getContentHashUpdates();
      }
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    });
    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, getContentHashUpdates]);

  useEffect(() => {
    getContentHashUpdates();
    // run it once on load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 font-sans flex flex-col min-h-screen">
      <header className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-b-2xl shadow-xl p-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <img src="./logo.svg" alt="Logo" width="80" height="80" />
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  Eth.ac <span className="font-light">Decentralized Web Explorer</span>
                </h1>
                <p className="text-xl text-white mt-2 opacity-80 font-light tracking-wide">Scanning for the latest from the Decentralized Web</p>
              </div>
            </div>
            <div>
              <div className="hidden lg:flex items-center justify-end pr-3 pt-3">
                <IoMdPulse className="text-white text-3xl animate-pulse" />
              </div>
              <div className="hidden lg:flex space-x-4">
                <div className="flex justify-end mt-[50px]">
                  <ConnectButton />
                </div>
                {network && (
                  <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-full px-4 py-2 text-sm text-white">
                    <span className="font-medium">Network:</span> {network}
                  </div>
                )}
              </div>
            </div>
          </div>
          {account && (
            <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-full px-4 py-2 text-sm text-white">
              <span className="font-medium">Account:</span> {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          )}
        </div>
      </header>

      <div className="flex-grow overflow-x-auto mt-8">
        <div className="grid grid-cols-6 lg:grid-cols-12 gap-4 bg-gray-100 p-4 rounded-t-lg font-medium text-gray-500 uppercase text-sm">
          <div className="col-span-3">Domain</div>
          <div className="hidden lg:block col-span-1">Block #</div>
          <div className="col-span-2">Time Confirmed</div>
          <div className="hidden lg:block col-span-5">Content Hash</div>
          <div className="col-span-1">Link</div>
        </div>
        <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
          {contentHashUpdates.map((update, index) => (
            <ContentHashUpdateRow
              key={update.id}
              update={update}
              ref={index === contentHashUpdates.length - 1 ? lastElementRef : null}
            />
          ))}
          {loading && (
            <div className="text-center py-4">
              <p>Loading more...</p>
            </div>
          )}
          {!hasMore && (
            <div className="text-center py-4">
              <p>No more updates to load</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
