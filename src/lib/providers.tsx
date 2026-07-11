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
  (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined) ?? sepoliaFhe.network;

// The Zama testnet relayer only sends CORS headers on GET, not on the encrypt
// POST (/input-proof), so a browser cross-origin POST is blocked and encrypt()
// hangs 30s ("Worker operation ENCRYPT timed out"). Route the relayer through the
// same-origin Vite proxy (/relayer -> https://relayer.testnet.zama.org/v2) so the
// SDK never makes a cross-origin POST. The SDK validates relayerUrl as an ABSOLUTE
// URL, so use window.location.origin (not the bare "/relayer" relative path).
const relayerUrl =
  (import.meta.env.VITE_RELAYER_PROXY as string | undefined) ??
  `${window.location.origin}/relayer`;

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
