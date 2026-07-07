import { useAccount, useConnect, useDisconnect } from 'wagmi';

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton({ className = '' }: { className?: string }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className={className}
      >
        {shortAddress(address)}
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        const connector = connectors[0];
        if (connector) connect({ connector });
      }}
      className={className}
      disabled={isPending || connectors.length === 0}
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
