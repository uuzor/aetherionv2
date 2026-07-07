import { mainnet, sepolia } from 'viem/chains';
import type { Address } from 'viem';

export const SUPPORTED_CHAINS = {
  mainnet,
  sepolia,
} as const;

export interface WalletState {
  address: Address | null;
  isConnected: boolean;
  chainId: number | null;
}

export async function getConnectedAddress(): Promise<Address | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as Address[];
    return accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

export async function isWalletConnected(): Promise<boolean> {
  const address = await getConnectedAddress();
  return address !== null;
}

export async function connectWallet(chain: typeof mainnet | typeof sepolia = sepolia): Promise<Address> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum wallet detected');
  }

  try {
    const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as Address[];

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    const expectedChainId = `0x${chain.id.toString(16)}`;

    if (currentChainId !== expectedChainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: expectedChainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: expectedChainId,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrls.default.http[0]],
                blockExplorerUrls: chain.blockExplorers?.default.url ? [chain.blockExplorers.default.url] : undefined,
              },
            ],
          });
        }
      }
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Connection rejected by user');
    }
    throw error;
  }
}

export async function getWalletState(): Promise<WalletState> {
  const address = await getConnectedAddress();

  let chainId: number | null = null;
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const chainIdHex = (await window.ethereum.request({ method: 'eth_chainId' })) as string;
      chainId = parseInt(chainIdHex, 16);
    } catch {
      chainId = null;
    }
  }

  return {
    address,
    isConnected: address !== null,
    chainId,
  };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
