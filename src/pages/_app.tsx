import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { config } from '../wagmi';
import Layout from '../components/Layout';

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";

const client = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DynamicContextProvider
      settings={{
        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
        environmentId: "b381b0ae-e01d-4414-912a-c80ac3452d2b",
        apiBaseUrl: 'https://authed.eth.ac/api/v0',
        walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <DynamicWagmiConnector>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
