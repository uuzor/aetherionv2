import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';
import { minorityWinRooms, type GameRoom, type GameOption } from '../data/games';

const STORAGE_KEY = 'uneventful-minority-win-custom-markets';

export type CustomMinorityMarketInput = {
  id?: string;
  contractGameId: bigint;
  question: string;
  questionImageUrl?: string;
  stakeTokenAddress: Address;
  confidentialTokenAddress?: Address;
  prizePool?: string;
  entryStake: string;
  timeLeft: string;
  chain?: 'BNB' | 'ETH';
  options: Array<{
    label: string;
    imageUrl?: string;
  }>;
};

function toTitle(question: string) {
  return question.length > 48 ? `${question.slice(0, 48).trim()}...` : question;
}

function normalizeCustomMarket(raw: any): GameRoom | null {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || typeof raw.prompt !== 'string' || !Array.isArray(raw.options)) {
    return null;
  }

  return {
    id: raw.id,
    gameId: 'minority-win',
    contractGameId: typeof raw.contractGameId === 'string' || typeof raw.contractGameId === 'number' ? BigInt(raw.contractGameId) : undefined,
    isCustom: true,
    questionImageUrl: typeof raw.questionImageUrl === 'string' ? raw.questionImageUrl : undefined,
    name: typeof raw.name === 'string' ? raw.name : toTitle(raw.prompt),
    prompt: raw.prompt,
    options: raw.options.map((option: any) => ({
      label: typeof option?.label === 'string' ? option.label : 'Option',
      votes: typeof option?.votes === 'number' ? option.votes : 0,
      pct: typeof option?.pct === 'number' ? option.pct : 0,
      imageUrl: typeof option?.imageUrl === 'string' ? option.imageUrl : undefined,
    })) as GameOption[],
    status: 'OPEN',
    players: typeof raw.players === 'number' ? raw.players : 0,
    prizePool: typeof raw.prizePool === 'string' ? raw.prizePool : 'Pending stake setup',
    entryStake: typeof raw.entryStake === 'string' ? raw.entryStake : 'Not set',
    timeLeft: typeof raw.timeLeft === 'string' ? raw.timeLeft : 'Created locally',
    chain: raw.chain === 'BNB' ? 'BNB' : 'ETH',
    messages: Array.isArray(raw.messages) ? raw.messages : [],
  };
}

function readCustomMarkets(): GameRoom[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeCustomMarket).filter((market): market is GameRoom => market !== null);
  } catch {
    return [];
  }
}

function writeCustomMarkets(markets: GameRoom[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(markets));
}

export function useMinorityWinMarkets() {
  const [customMarkets, setCustomMarkets] = useState<GameRoom[]>([]);

  useEffect(() => {
    setCustomMarkets(readCustomMarkets());
  }, []);

  const markets = useMemo(() => [...minorityWinRooms, ...customMarkets], [customMarkets]);

  function createMarket(input: CustomMinorityMarketInput) {
    const marketId = input.id ?? `mw-${input.contractGameId.toString()}`;

    const customMarket: GameRoom = {
      id: marketId,
      gameId: 'minority-win',
      contractGameId: input.contractGameId,
      isCustom: true,
      name: toTitle(input.question),
      prompt: input.question,
      questionImageUrl: input.questionImageUrl,
      options: input.options.map((option) => ({
        label: option.label,
        votes: 0,
        pct: 0,
        imageUrl: option.imageUrl,
      })),
      status: 'OPEN',
      players: 0,
      prizePool: input.prizePool ?? '0',
      entryStake: input.entryStake,
      timeLeft: input.timeLeft,
      chain: input.chain ?? 'ETH',
      messages: [
        { user: 'system', text: 'This social market was created on-chain first, then its images were stored in Supabase.', time: 'now' },
        { user: 'system', text: `Stake token ${input.stakeTokenAddress}${input.confidentialTokenAddress ? ` · confidential wrapper ${input.confidentialTokenAddress}` : ''}`, time: 'now' },
      ],
    };

    setCustomMarkets((previous) => {
      const next = [customMarket, ...previous];
      writeCustomMarkets(next);
      return next;
    });

    return customMarket;
  }

  function getMarketById(id: string) {
    return markets.find((market) => market.id === id);
  }

  return {
    markets,
    customMarkets,
    createMarket,
    getMarketById,
  };
}
