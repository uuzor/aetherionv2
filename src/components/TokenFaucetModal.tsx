import { useMemo, useState } from 'react';
import { Check, Coins, KeyRound, Loader2, Lock, RefreshCw, Shield, Unlock, X } from 'lucide-react';
import {
  useApproveUnderlying,
  useConfidentialBalance,
  useConfidentialIsOperator,
  useConfidentialSetOperator,
  useGrantPermit,
  useHasPermit,
  useListPairs,
  useShield,
  useUnderlyingAllowance,
  useUnshield,
} from '@zama-fhe/react-sdk';
import type { TokenWrapperPairWithMetadata } from '@zama-fhe/sdk';
import { formatUnits, parseUnits, type Address } from 'viem';
import { sepolia } from 'wagmi/chains';
import { useAccount, useChainId, usePublicClient, useReadContract, useSwitchChain, useWriteContract } from 'wagmi';
import { ERC20_ABI, MINORITY_WINS_ADDRESS } from '../lib/minority';
import { useTokenRegistryPairs } from '../lib';

const FAUCET_ABI = [
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'faucet',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const;

type FaucetAttempt =
  | { functionName: 'mint'; args: readonly [Address, bigint] }
  | { functionName: 'mint'; args: readonly [bigint] }
  | { functionName: 'faucet'; args: readonly [] };

type PairWithMeta = TokenWrapperPairWithMetadata & {
  underlying: TokenWrapperPairWithMetadata['underlying'];
  confidential: TokenWrapperPairWithMetadata['confidential'];
};

type Props = {
  open: boolean;
  onClose: () => void;
};

function shortAddress(address: Address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(value: bigint | undefined, decimals: number, symbol: string) {
  if (value === undefined) {
    return 'Locked';
  }

  const text = formatUnits(value, decimals);
  const [whole, fraction = ''] = text.split('.');
  const trimmedFraction = fraction.slice(0, 4).replace(/0+$/, '');
  return `${trimmedFraction ? `${whole}.${trimmedFraction}` : whole} ${symbol}`;
}

function humanError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('User rejected') || error.message.includes('rejected')) {
      return 'Transaction rejected in wallet.';
    }

    if (error.message.includes('insufficient')) {
      return 'Insufficient balance or gas for this action.';
    }

    if (error.message.includes('allowance')) {
      return 'Approval is missing or too low.';
    }

    return error.message;
  }

  return 'Action failed.';
}

export function TokenFaucetModal({ open, onClose }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  // const { pairs, isLoading: tokenRegistryLoading } = useTokenRegistryPairs(true);
  const { data, isLoading, error, refetch } = useListPairs({ page: 1, pageSize: 20, metadata: true });
  console.log(data)
  const pairs = useMemo(
    () => ((data?.items ?? []) as PairWithMeta[]).filter((pair) => pair.isValid),
    [data?.items]
  );
  const confidentialAddresses = pairs.map((pair) => pair.confidentialTokenAddress);
  const { data: hasPermit, isLoading: isCheckingPermit } = useHasPermit(
    { contractAddresses: confidentialAddresses },
    { enabled: open && isConnected && confidentialAddresses.length > 0 }
  );
  const { mutateAsync: grantPermit, isPending: isGrantingPermit } = useGrantPermit();

  if (!open) {
    return null;
  }

  const wrongNetwork = chainId !== sepolia.id;

  async function handleGrantPermit() {
    if (confidentialAddresses.length === 0) return;
    await grantPermit(confidentialAddresses);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-chalk/10 bg-carbon p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
              SEPOLIA TOKEN VAULT
            </p>
            <h2 className="mt-2 font-medium text-bone" style={{ fontSize: '28px', lineHeight: 1.1 }}>
              Mint, wrap, and unwrap registry tokens
            </h2>
          </div>
          <button onClick={onClose} className="text-stone transition-colors hover:text-bone">
            <X size={20} />
          </button>
        </div>

        {!isConnected ? (
          <StatusPanel icon={Lock} title="Connect wallet" message="Connect a Sepolia wallet to mint test tokens and decrypt confidential balances." />
        ) : wrongNetwork ? (
          <div className="flex items-center justify-between gap-4 border border-amber-400/20 bg-amber-400/5 p-4">
            <StatusPanel icon={RefreshCw} title="Wrong network" message="Switch to Sepolia before using Zama wrapper tokens." compact />
            <button
              onClick={() => switchChain({ chainId: sepolia.id })}
              disabled={isSwitching}
              className="rounded-btn bg-citrine px-5 py-3 font-medium text-carbon disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontSize: '13px' }}
            >
              {isSwitching ? 'Switching...' : 'Switch'}
            </button>
          </div>
        ) : null}

        {isConnected && !wrongNetwork && confidentialAddresses.length > 0 && !hasPermit ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border border-citrine/20 bg-citrine/5 p-4">
            <div className="flex items-center gap-3">
              <KeyRound size={18} className="text-citrine" />
              <div>
                <p className="font-medium text-bone" style={{ fontSize: '14px' }}>Decrypt confidential balances</p>
                <p className="text-stone" style={{ fontSize: '12px', lineHeight: 1.5 }}>
                  This signs one EIP-712 permit for the listed ERC-7984 tokens.
                </p>
              </div>
            </div>
            <button
              onClick={() => void handleGrantPermit()}
              disabled={isGrantingPermit || isCheckingPermit}
              className="flex items-center gap-2 rounded-btn bg-citrine px-5 py-3 font-medium text-carbon disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontSize: '13px' }}
            >
              {isGrantingPermit ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
              {isGrantingPermit ? 'Signing...' : 'Decrypt balances'}
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <StatusPanel icon={Loader2} title="Loading registry" message="Reading token wrapper pairs from the Zama Sepolia registry." spinning />
        ) : error ? (
          <StatusPanel icon={X} title="Registry unavailable" message={error.message} />
        ) : pairs.length === 0 ? (
          <StatusPanel icon={Coins} title="No supported tokens" message="The registry returned no valid wrapper pairs for this network." />
        ) : (
          <div className="space-y-3">
            {pairs.map((pair) => (
              <TokenRow
                key={pair.confidentialTokenAddress}
                pair={pair}
                account={address}
                canDecrypt={Boolean(hasPermit)}
                onChanged={() => void refetch()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TokenRow({
  pair,
  account,
  canDecrypt,
  onChanged,
}: {
  pair: PairWithMeta;
  account?: Address;
  canDecrypt: boolean;
  onChanged: () => void;
}) {
  const [amount, setAmount] = useState('100');
  const [feedback, setFeedback] = useState('');
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { data: publicBalance, refetch: refetchPublicBalance } = useReadContract({
    address: pair.tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    query: { enabled: Boolean(account) },
  });
  const confidentialBalance = useConfidentialBalance(
    { address: pair.confidentialTokenAddress, account },
    { enabled: canDecrypt && Boolean(account) }
  );
  const allowance = useUnderlyingAllowance(
    { address: pair.confidentialTokenAddress, owner: account },
    { enabled: Boolean(account) }
  );
  const gameOperator = useConfidentialIsOperator(
    { address: pair.confidentialTokenAddress, holder: account, spender: MINORITY_WINS_ADDRESS },
    { enabled: Boolean(account) }
  );
  const approveUnderlying = useApproveUnderlying(pair.confidentialTokenAddress);
  const shield = useShield({ address: pair.confidentialTokenAddress, optimistic: true });
  const unshield = useUnshield(pair.confidentialTokenAddress);
  const setOperator = useConfidentialSetOperator(pair.confidentialTokenAddress);

  const parsedAmount = useMemo(() => {
    try {
      return amount.trim() ? parseUnits(amount.trim(), pair.underlying.decimals) : 0n;
    } catch {
      return 0n;
    }
  }, [amount, pair.underlying.decimals]);

  const publicBalanceValue = publicBalance as bigint | undefined;
  const approvalNeeded = parsedAmount > 0n && (allowance.data ?? 0n) < parsedAmount;
  const busy = approveUnderlying.isPending || shield.isPending || unshield.isPending || setOperator.isPending;

  async function refreshBalances() {
    await Promise.all([refetchPublicBalance(), confidentialBalance.refetch(), allowance.refetch(), gameOperator.refetch()]);
    onChanged();
  }

  async function handleMint() {
    if (!account || !publicClient) return;
    setFeedback('');

    const attempts: FaucetAttempt[] = [
      { functionName: 'mint', args: [account, parsedAmount] },
      { functionName: 'mint', args: [parsedAmount] },
      { functionName: 'faucet', args: [] },
    ];

    try {
      for (const attempt of attempts) {
        try {
          await publicClient.simulateContract({
            address: pair.tokenAddress,
            abi: FAUCET_ABI,
            functionName: attempt.functionName,
            args: attempt.args,
            account,
          } as any);

          const hash = await writeContractAsync({
            address: pair.tokenAddress,
            abi: FAUCET_ABI,
            functionName: attempt.functionName,
            args: attempt.args,
          } as any);
          await publicClient.waitForTransactionReceipt({ hash });
          await refreshBalances();
          setFeedback('Mint confirmed.');
          return;
        } catch {
          continue;
        }
      }

      throw new Error('This token does not expose a supported cTokenMock faucet method.');
    } catch (error) {
      setFeedback(humanError(error));
    }
  }

  async function handleApprove() {
    if (parsedAmount <= 0n) return;
    setFeedback('');
    try {
      await approveUnderlying.mutateAsync({ amount: parsedAmount });
      await refreshBalances();
      setFeedback('Underlying approval confirmed.');
    } catch (error) {
      setFeedback(humanError(error));
    }
  }

  async function handleWrap() {
    if (parsedAmount <= 0n) return;
    setFeedback('');
    try {
      await shield.mutateAsync({ amount: parsedAmount });
      await refreshBalances();
      setFeedback('Wrap confirmed.');
    } catch (error) {
      setFeedback(humanError(error));
    }
  }

  async function handleUnwrap() {
    if (parsedAmount <= 0n) return;
    setFeedback('');
    try {
      await unshield.mutateAsync({ amount: parsedAmount });
      await refreshBalances();
      setFeedback('Unwrap finalized.');
    } catch (error) {
      setFeedback(humanError(error));
    }
  }

  async function handleSetOperator() {
    setFeedback('');
    try {
      const until = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      await setOperator.mutateAsync({ operator: MINORITY_WINS_ADDRESS, until });
      await gameOperator.refetch();
      setFeedback('Game operator approved for 24 hours.');
    } catch (error) {
      setFeedback(humanError(error));
    }
  }

  return (
    <div className="border border-chalk/10 bg-graphite/20 p-4">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-chalk/10 bg-carbon text-citrine">
              <Coins size={18} />
            </div>
            <div>
              <h3 className="font-medium text-bone" style={{ fontSize: '18px', lineHeight: 1.2 }}>
                {pair.underlying.symbol} / {pair.confidential.symbol}
              </h3>
              <p className="text-stone" style={{ fontSize: '12px' }}>{pair.underlying.name}</p>
            </div>
            {gameOperator.data ? (
              <span className="ml-auto flex items-center gap-1.5 rounded-btn border border-citrine/20 bg-citrine/5 px-3 py-1 text-citrine" style={{ fontSize: '10px' }}>
                <Check size={12} />
                GAME OPERATOR
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <BalanceBlock label="ERC-20 BALANCE" value={formatBalance(publicBalanceValue, pair.underlying.decimals, pair.underlying.symbol)} />
            <BalanceBlock
              label="CONFIDENTIAL BALANCE"
              value={
                canDecrypt
                  ? confidentialBalance.isLoading
                    ? 'Decrypting...'
                    : formatBalance(confidentialBalance.data, pair.confidential.decimals, pair.confidential.symbol)
                  : 'Needs permit'
              }
            />
          </div>

          <div className="mt-4 grid gap-2 text-stone md:grid-cols-2" style={{ fontSize: '11px' }}>
            <AddressLine label="ERC-20" address={pair.tokenAddress} />
            <AddressLine label="ERC-7984" address={pair.confidentialTokenAddress} />
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full border border-chalk/10 bg-carbon px-3 py-3 text-bone outline-none transition-colors focus:border-citrine/30"
            style={{ fontSize: '14px' }}
          />

          <div className="grid grid-cols-2 gap-2">
            <ActionButton icon={Coins} label="Mint" onClick={handleMint} disabled={busy || parsedAmount <= 0n || !account} />
            <ActionButton icon={KeyRound} label="Approve" onClick={handleApprove} disabled={busy || parsedAmount <= 0n || !approvalNeeded} />
            <ActionButton icon={Shield} label="Wrap" onClick={handleWrap} disabled={busy || parsedAmount <= 0n || approvalNeeded} />
            <ActionButton icon={Unlock} label="Unwrap" onClick={handleUnwrap} disabled={busy || parsedAmount <= 0n || !canDecrypt} />
          </div>

          <button
            onClick={() => void handleSetOperator()}
            disabled={busy || !account || Boolean(gameOperator.data)}
            className="flex w-full items-center justify-center gap-2 rounded-btn border border-chalk/10 bg-carbon px-3 py-2.5 font-medium text-bone transition-colors hover:border-citrine/30 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontSize: '12px' }}
          >
            {setOperator.isPending ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} className="text-citrine" />}
            {gameOperator.data ? 'Operator approved' : 'Approve game operator'}
          </button>

          {feedback ? (
            <p className="border border-chalk/10 bg-carbon px-3 py-2 text-stone" style={{ fontSize: '11px', lineHeight: 1.5 }}>
              {feedback}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BalanceBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-chalk/10 bg-carbon p-3">
      <p className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>{label}</p>
      <p className="mt-1 font-medium text-bone" style={{ fontSize: '15px' }}>{value}</p>
    </div>
  );
}

function AddressLine({ label, address }: { label: string; address: Address }) {
  return (
    <div className="flex items-center justify-between gap-3 border border-chalk/10 bg-carbon px-3 py-2">
      <span className="font-medium text-stone">{label}</span>
      <span className="text-bone" title={address}>{shortAddress(address)}</span>
    </div>
  );
}

type IconType = typeof Coins;

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: IconType;
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => void onClick()}
      disabled={disabled}
      className="flex items-center justify-center gap-2 rounded-btn bg-citrine px-3 py-2.5 font-medium text-carbon transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ fontSize: '12px' }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function StatusPanel({
  icon: Icon,
  title,
  message,
  compact = false,
  spinning = false,
}: {
  icon: IconType;
  title: string;
  message: string;
  compact?: boolean;
  spinning?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'border border-chalk/10 bg-graphite/20 p-6'}`}>
      <Icon size={compact ? 18 : 22} className={`text-citrine ${spinning ? 'animate-spin' : ''}`} />
      <div>
        <p className="font-medium text-bone" style={{ fontSize: compact ? '14px' : '16px' }}>{title}</p>
        <p className="text-stone" style={{ fontSize: '12px', lineHeight: 1.5 }}>{message}</p>
      </div>
    </div>
  );
}
