// Type definitions for Zama SDK integration

import type { Address } from 'viem';

export interface GameInfo {
  question: string;
  stakeToken: Address;
  stake: bigint;
  deadline: bigint;
  status: GameStatus;
  pot: bigint;
  playerCount: bigint;
}

export enum GameStatus {
  Open = 0,
  AwaitingTally = 1,
  Resolved = 2,
}

export interface GameCreateParams {
  question: string;
  stakeToken: Address;
  stake: bigint;
  durationSeconds: number;
}

export interface TokenBalance {
  raw: bigint;
  formatted: string;
  decimals: number;
}

export interface TransactionResult {
  hash: `0x${string}`;
  confirmations?: number;
  blockNumber?: bigint;
}

export const CONTRACT_ADDRESSES = {
  sepolia: {
    minorityWins: '0xDDB053271DFd6fb8386518fe6922A3c342dd3C0A',
    erc7984Example: '0xFA1B8f633D5676D6Ac291046Fe5d21fEc6f11506',
    fheCounter: '0x893C720D4C14767d2048ed342BcA799DA616747f',
  },
} as const;
