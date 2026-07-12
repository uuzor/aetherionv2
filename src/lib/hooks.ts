import { useCallback } from 'react';
import type { Address, Hash } from 'viem';
import { decodeEventLog } from 'viem';
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import { useEncrypt } from '@zama-fhe/react-sdk';
import {
  ERC20_ABI,
  MINORITY_WINS_ABI,
  MINORITY_WINS_ADDRESS,
  TOKEN_REGISTRY_LOOKUP_KEY,
  TOKEN_WRAPPERS_REGISTRY_ABI,
  TOKEN_WRAPPERS_REGISTRY_ADDRESS,
} from './minority';
import type { GameCreateParams, GameInfo, GameStatus } from './types';
import { CONTRACT_ADDRESSES } from './types';

type GameInfoTuple = readonly [string, Address, bigint, bigint, number, bigint, bigint];
type TokenWrapperPair = {
  tokenAddress: Address;
  confidentialTokenAddress: Address;
  isValid: boolean;
};

export function useMinorityGame(
  gameId: bigint,
  contractAddress: Address = MINORITY_WINS_ADDRESS,
  enabled = true
) {
  const gameQuery = useReadContract({
    address: contractAddress,
    abi: MINORITY_WINS_ABI,
    functionName: 'getGameInfo',
    args: enabled ? [gameId] : undefined,
    query: { enabled },
  });

  const { address } = useAccount();
  const joinedQuery = useReadContract({
    address: contractAddress,
    abi: MINORITY_WINS_ABI,
    functionName: 'hasJoined',
    args: enabled && address ? [gameId, address] : undefined,
    query: { enabled: enabled && Boolean(address) },
  });

  const data = gameQuery.data as GameInfoTuple | undefined;
  const status = data ? (data[4] as GameStatus) : undefined;

  const clearCountsQuery = useReadContract({
    address: contractAddress,
    abi: MINORITY_WINS_ABI,
    functionName: 'getClearCounts',
    args: enabled ? [gameId] : undefined,
    query: { enabled: enabled && status === 2 },
  });

  return {
    gameInfo: data
      ? {
          question: data[0],
          stakeToken: data[1],
          stake: data[2],
          deadline: data[3],
          status: data[4] as GameStatus,
          pot: data[5],
          playerCount: data[6],
        }
      : null,
    hasJoined: Boolean(joinedQuery.data),
    clearCounts: clearCountsQuery.data as readonly [number, number, number] | undefined,
    isLoading: enabled && (gameQuery.isLoading || joinedQuery.isLoading),
    error: gameQuery.error ?? joinedQuery.error ?? clearCountsQuery.error ?? null,
    refetch: gameQuery.refetch,
  };
}

export function useTokenRegistryPairs(enabled = true) {
  const query = useReadContract({
    address: TOKEN_WRAPPERS_REGISTRY_ADDRESS,
    abi: TOKEN_WRAPPERS_REGISTRY_ABI,
    functionName: 'getTokenConfidentialTokenPairs',
    args: [],
    query: { enabled },
  });

  console.log(query)

  const pairs = ((query.data as TokenWrapperPair[] | undefined) ?? []).filter((pair) => pair.isValid);

  return {
    pairs,
    isLoading: enabled && query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}

export function useTokenMetadata(tokenAddress?: Address, enabled = true) {
  const symbolQuery = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    args: [],
    query: { enabled: enabled && Boolean(tokenAddress) },
  });

  const decimalsQuery = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    args: [],
    query: { enabled: enabled && Boolean(tokenAddress) },
  });

  return {
    symbol: symbolQuery.data as string | undefined,
    decimals: decimalsQuery.data as number | undefined,
    isLoading: enabled && (symbolQuery.isLoading || decimalsQuery.isLoading),
    error: symbolQuery.error ?? decimalsQuery.error ?? null,
  };
}

export function useTokenAllowance(tokenAddress?: Address, owner?: Address, spender?: Address, enabled = true) {
  const query = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: enabled && owner && spender ? [owner, spender] : undefined,
    query: { enabled: enabled && Boolean(tokenAddress && owner && spender) },
  });

  return {
    allowance: query.data as bigint | undefined,
    isLoading: enabled && query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}

export function useApproveToken() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const approve = useCallback(
    async (tokenAddress: Address, spender: Address, amount: bigint): Promise<Hash> => {
      return writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, amount],
      });
    },
    [writeContractAsync]
  );

  return { approve, isApproving: isPending, approveError: error ?? null };
}

export function useSubmitPick(contractAddress: Address = MINORITY_WINS_ADDRESS) {
  const { address } = useAccount();
  const encrypt = useEncrypt();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const submitPick = useCallback(
    async (gameId: bigint, choice: number): Promise<Hash> => {
      if (!address) {
        throw new Error('Connect a wallet first.');
      }

      if (choice < 0 || choice > 2) {
        throw new Error('Choice must be 0, 1, or 2.');
      }
      console.log(choice)

      const encrypted = await encrypt.mutateAsync({
        values: [{ value: BigInt(choice), type: 'euint8' }],
        contractAddress,
        userAddress: address,
      });

      console.log(encrypted)

      const encryptedChoice = encrypted.encryptedValues[0];
      if (!encryptedChoice) {
        throw new Error('Encryption did not return a handle.');
      }
      console.log([gameId, encryptedChoice, encrypted.inputProof])
      return writeContractAsync({
        address: contractAddress,
        abi: MINORITY_WINS_ABI,
        functionName: 'submitPick',
        args: [gameId, encryptedChoice, encrypted.inputProof],
      });
    },
    [address, contractAddress, encrypt, writeContractAsync]
  );

  return {
    submitPick,
    isSubmitting: isPending || encrypt.isPending,
    submitError: error ?? null,
    encryptError: encrypt.error ?? null,
  };
}

export function useCreateGame(contractAddress: Address = MINORITY_WINS_ADDRESS) {
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const createGame = useCallback(
    async (question: string, stakeToken: Address, stake: bigint, durationSeconds: number) => {
      if (!publicClient) {
        throw new Error('Public client unavailable.');
      }

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: MINORITY_WINS_ABI,
        functionName: 'createGame',
        args: [question, stakeToken, stake, BigInt(durationSeconds)],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const createdLog = receipt.logs.find((log) => log.address.toLowerCase() === contractAddress.toLowerCase());

      if (!createdLog) {
        throw new Error('GameCreated event not found in receipt.');
      }

      const decoded = decodeEventLog({
        abi: MINORITY_WINS_ABI,
        data: createdLog.data,
        topics: createdLog.topics,
      });

      if (decoded.eventName !== 'GameCreated') {
        throw new Error('Unexpected event emitted while creating game.');
      }

      return {
        hash,
        gameId: decoded.args.gameId as bigint,
      };
    },
    [contractAddress, publicClient, writeContractAsync]
  );

  return { createGame, isCreating: isPending, createError: error ?? null };
}

export function useRequestTallyReveal(contractAddress: Address = MINORITY_WINS_ADDRESS) {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const requestTallyReveal = useCallback(
    async (gameId: bigint) => {
      return writeContractAsync({
        address: contractAddress,
        abi: MINORITY_WINS_ABI,
        functionName: 'requestTallyReveal',
        args: [gameId],
      });
    },
    [contractAddress, writeContractAsync]
  );

  return { requestTallyReveal, isRequesting: isPending, requestError: error ?? null };
}

export function useRequestClaimCheck(contractAddress: Address = MINORITY_WINS_ADDRESS) {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const requestClaimCheck = useCallback(
    async (gameId: bigint) => {
      return writeContractAsync({
        address: contractAddress,
        abi: MINORITY_WINS_ABI,
        functionName: 'requestClaimCheck',
        args: [gameId],
      });
    },
    [contractAddress, writeContractAsync]
  );

  return { requestClaimCheck, isRequesting: isPending, requestError: error ?? null };
}

export function useFinalizeClaim(contractAddress: Address = MINORITY_WINS_ADDRESS) {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const finalizeClaim = useCallback(
    async (gameId: bigint, won: boolean, decryptionProof: `0x${string}`) => {
      return writeContractAsync({
        address: contractAddress,
        abi: MINORITY_WINS_ABI,
        functionName: 'finalizeClaim',
        args: [gameId, won, decryptionProof],
      });
    },
    [contractAddress, writeContractAsync]
  );

  return { finalizeClaim, isFinalizing: isPending, finalizeError: error ?? null };
}

export { CONTRACT_ADDRESSES };
export type { GameInfo, GameStatus, GameCreateParams } from './types';
