import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES } from './types';

export const MINORITY_WINS_ADDRESS = CONTRACT_ADDRESSES.sepolia.minorityWins as Address;
export const TOKEN_WRAPPERS_REGISTRY_ADDRESS = '0x2f0750Bbb0A246059d80e94c454586a7F27a128e' as Address;
export const TOKEN_REGISTRY_LOOKUP_KEY = '0xf63a0980' as const;

export const MINORITY_WINS_ABI = [
		{
			"inputs": [],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"inputs": [],
			"name": "InvalidKMSSignatures",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "token",
					"type": "address"
				}
			],
			"name": "SafeERC20FailedOperation",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "handle",
					"type": "bytes32"
				},
				{
					"internalType": "address",
					"name": "sender",
					"type": "address"
				}
			],
			"name": "SenderNotAllowedToUseHandle",
			"type": "error"
		},
		{
			"inputs": [],
			"name": "ZamaProtocolUnsupported",
			"type": "error"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "question",
					"type": "string"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "stakeToken",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "stake",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "deadline",
					"type": "uint256"
				}
			],
			"name": "GameCreated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint32[3]",
					"name": "clearCounts",
					"type": "uint32[3]"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "winnerCount",
					"type": "uint256"
				}
			],
			"name": "GameResolved",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				}
			],
			"name": "PickSubmitted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "bytes32[]",
					"name": "handlesList",
					"type": "bytes32[]"
				},
				{
					"indexed": false,
					"internalType": "bytes",
					"name": "abiEncodedCleartexts",
					"type": "bytes"
				}
			],
			"name": "PublicDecryptionVerified",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "TallyRevealRequested",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "WinningsClaimed",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "OPTIONS",
			"outputs": [
				{
					"internalType": "uint8",
					"name": "",
					"type": "uint8"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "confidentialProtocolId",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "question",
					"type": "string"
				},
				{
					"internalType": "contract IERC20",
					"name": "stakeToken",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "stake",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "durationSeconds",
					"type": "uint256"
				}
			],
			"name": "createGame",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "won",
					"type": "bool"
				},
				{
					"internalType": "bytes",
					"name": "decryptionProof",
					"type": "bytes"
				}
			],
			"name": "finalizeClaim",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "getClearCounts",
			"outputs": [
				{
					"internalType": "uint32[3]",
					"name": "",
					"type": "uint32[3]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "getGameInfo",
			"outputs": [
				{
					"internalType": "string",
					"name": "question",
					"type": "string"
				},
				{
					"internalType": "address",
					"name": "stakeToken",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "stake",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "deadline",
					"type": "uint256"
				},
				{
					"internalType": "enum MinorityWins.Status",
					"name": "status",
					"type": "uint8"
				},
				{
					"internalType": "uint256",
					"name": "pot",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "playerCount",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "player",
					"type": "address"
				}
			],
			"name": "hasJoined",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "nextGameId",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "requestClaimCheck",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				}
			],
			"name": "requestTallyReveal",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"internalType": "uint32[3]",
					"name": "clearCounts",
					"type": "uint32[3]"
				},
				{
					"internalType": "bytes",
					"name": "decryptionProof",
					"type": "bytes"
				}
			],
			"name": "resolveGame",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "gameId",
					"type": "uint256"
				},
				{
					"internalType": "externalEuint8",
					"name": "encryptedChoice",
					"type": "bytes32"
				},
				{
					"internalType": "bytes",
					"name": "inputProof",
					"type": "bytes"
				}
			],
			"name": "submitPick",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
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
