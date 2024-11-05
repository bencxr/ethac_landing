'use client';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

import { createConfig } from 'wagmi';
import { http } from 'viem';

export const config = createConfig({
  chains: [base, mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});
