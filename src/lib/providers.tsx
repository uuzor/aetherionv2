import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ZamaProvider } from '@zama-fhe/react-sdk';
import { createConfig as createZamaConfig } from '@zama-fhe/react-sdk/wagmi';
import { web } from '@zama-fhe/sdk/web';
import { sepolia as sepoliaFhe, type FheChain } from '@zama-fhe/sdk/chains';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';

const rpcUrl =
  (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined) ?? 'https://eth-sepolia-testnet.api.pocket.network';
const relayerUrl =
  (import.meta.env.VITE_SEPOLIA_RELAYER_URL as string | undefined) ?? 'https://relayer.sepolia.zama.dev';

const zamaChain = {
  ...sepoliaFhe,
  relayerUrl,
  network: rpcUrl,
} as const satisfies FheChain;

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
});

const zamaConfig = createZamaConfig({
  chains: [zamaChain],
  wagmiConfig,
  relayers: {
    [zamaChain.id]: web(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider config={zamaConfig}>{children}</ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
