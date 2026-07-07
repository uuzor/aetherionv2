import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES } from './types';

export const MINORITY_WINS_ADDRESS = CONTRACT_ADDRESSES.sepolia.minorityWins as Address;
export const TOKEN_WRAPPERS_REGISTRY_ADDRESS = '0x2f0750Bbb0A246059d80e94c454586a7F27a128e' as Address;
export const TOKEN_REGISTRY_LOOKUP_KEY = '0xf63a0980' as const;

export const MINORITY_WINS_ABI = [
  {
    type: 'event',
    name: 'GameCreated',
    inputs: [
      { indexed: true, name: 'gameId', type: 'uint256' },
      { indexed: false, name: 'question', type: 'string' },
      { indexed: true, name: 'stakeToken', type: 'address' },
      { indexed: false, name: 'stake', type: 'uint256' },
      { indexed: false, name: 'deadline', type: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'createGame',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'stakeToken', type: 'address' },
      { name: 'stake', type: 'uint256' },
      { name: 'durationSeconds', type: 'uint256' },
    ],
    outputs: [{ name: 'gameId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'submitPick',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'encryptedChoice', type: 'bytes' },
      { name: 'inputProof', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'requestTallyReveal',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'resolveGame',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'clearCounts', type: 'uint32[3]' },
      { name: 'decryptionProof', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'requestClaimCheck',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'finalizeClaim',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'won', type: 'bool' },
      { name: 'decryptionProof', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getGameInfo',
    stateMutability: 'view',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [
      { name: 'question', type: 'string' },
      { name: 'stakeToken', type: 'address' },
      { name: 'stake', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'pot', type: 'uint256' },
      { name: 'playerCount', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'hasJoined',
    stateMutability: 'view',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'player', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getClearCounts',
    stateMutability: 'view',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint32[3]' }],
  },
  {
    type: 'function',
    name: 'nextGameId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export const TOKEN_WRAPPERS_REGISTRY_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"target","type":"address"}],"name":"AddressEmptyCode","type":"error"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"existingConfidentialTokenAddress","type":"address"}],"name":"ConfidentialTokenAlreadyAssociatedWithToken","type":"error"},{"inputs":[{"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"ConfidentialTokenDoesNotSupportERC165","type":"error"},{"inputs":[],"name":"ConfidentialTokenZeroAddress","type":"error"},{"inputs":[{"internalType":"address","name":"implementation","type":"address"}],"name":"ERC1967InvalidImplementation","type":"error"},{"inputs":[],"name":"ERC1967NonPayable","type":"error"},{"inputs":[],"name":"FailedCall","type":"error"},{"inputs":[{"internalType":"uint256","name":"fromIndex","type":"uint256"},{"internalType":"uint256","name":"toIndex","type":"uint256"}],"name":"FromIndexGreaterOrEqualToIndex","type":"error"},{"inputs":[],"name":"InvalidInitialization","type":"error"},{"inputs":[{"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"NoTokenAssociatedWithConfidentialToken","type":"error"},{"inputs":[{"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"NotERC7984","type":"error"},{"inputs":[],"name":"NotInitializing","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[{"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"RevokedConfidentialToken","type":"error"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"existingConfidentialTokenAddress","type":"address"}],"name":"TokenAlreadyAssociatedWithConfidentialToken","type":"error"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"}],"name":"TokenNotRegistered","type":"error"},{"inputs":[],"name":"TokenZeroAddress","type":"error"},{"inputs":[],"name":"UUPSUnauthorizedCallContext","type":"error"},{"inputs":[{"internalType":"bytes32","name":"slot","type":"bytes32"}],"name":"UUPSUnsupportedProxiableUUID","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"ConfidentialTokenRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"ConfidentialTokenRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint64","name":"version","type":"uint64"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"inputs":[],"name":"UPGRADE_INTERFACE_VERSION","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"}],"name":"getConfidentialTokenAddress","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"getTokenAddress","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getTokenConfidentialTokenPair","outputs":[{"components":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"confidentialTokenAddress","type":"address"},{"internalType":"bool","name":"isValid","type":"bool"}],"internalType":"struct ConfidentialTokenWrappersRegistry.TokenWrapperPair","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTokenConfidentialTokenPairs","outputs":[{"components":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"confidentialTokenAddress","type":"address"},{"internalType":"bool","name":"isValid","type":"bool"}],"internalType":"struct ConfidentialTokenWrappersRegistry.TokenWrapperPair[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTokenConfidentialTokenPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"fromIndex","type":"uint256"},{"internalType":"uint256","name":"toIndex","type":"uint256"}],"name":"getTokenConfidentialTokenPairsSlice","outputs":[{"components":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"confidentialTokenAddress","type":"address"},{"internalType":"bool","name":"isValid","type":"bool"}],"internalType":"struct ConfidentialTokenWrappersRegistry.TokenWrapperPair[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"}],"name":"getTokenIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"isConfidentialTokenValid","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"proxiableUUID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"registerConfidentialToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"confidentialTokenAddress","type":"address"}],"name":"revokeConfidentialToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"}] as const;

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

export const MINORITY_OPTION_LABELS = ['Option 1', 'Option 2', 'Option 3'] as const;

export function statusLabel(status: number): string {
  switch (status) {
    case 0:
      return 'Open';
    case 1:
      return 'Awaiting tally';
    case 2:
      return 'Resolved';
    default:
      return 'Unknown';
  }
}

export function formatTokenAmount(amount: bigint, decimals: number, fractionDigits = 3): string {
  const text = formatUnits(amount, decimals);
  const [integer, fraction = ''] = text.split('.');

  if (!fraction || Number(fraction) === 0) {
    return integer;
  }

  return `${integer}.${fraction.slice(0, fractionDigits).replace(/0+$/, '') || '0'}`;
}
