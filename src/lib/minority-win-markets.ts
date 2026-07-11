import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';
import { type GameRoom, type GameOption } from '../data/games';
import { supabase } from './supabase';

const MARKET_TABLE = 'minority_win_markets';

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

type MarketRow = {
  id: string;
  game_id: string;
  contract_game_id: string;
  name: string;
  prompt: string;
  question_image_url: string | null;
  options: unknown;
  status: GameRoom['status'];
  players: number;
  prize_pool: string;
  entry_stake: string;
  time_left: string;
  chain: 'BNB' | 'ETH';
  messages: unknown;
  stake_token_address: string;
  confidential_token_address: string | null;
  created_at?: string;
};

function toTitle(question: string) {
  return question.length > 48 ? `${question.slice(0, 48).trim()}...` : question;
}

function normalizeOptions(options: unknown): GameOption[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option: any) => ({
    label: typeof option?.label === 'string' ? option.label : 'Option',
    votes: typeof option?.votes === 'number' ? option.votes : 0,
    pct: typeof option?.pct === 'number' ? option.pct : 0,
    imageUrl: typeof option?.imageUrl === 'string' ? option.imageUrl : undefined,
  }));
}

function normalizeMessages(messages: unknown): GameRoom['messages'] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message: any) => ({
      user: typeof message?.user === 'string' ? message.user : 'system',
      text: typeof message?.text === 'string' ? message.text : '',
      time: typeof message?.time === 'string' ? message.time : 'now',
    }))
    .filter((message) => message.text.length > 0);
}

function rowToMarket(row: MarketRow): GameRoom {
  return {
    id: row.id,
    gameId: row.game_id,
    contractGameId: BigInt(row.contract_game_id),
    isCustom: true,
    questionImageUrl: row.question_image_url ?? undefined,
    name: row.name || toTitle(row.prompt),
    prompt: row.prompt,
    options: normalizeOptions(row.options),
    status: row.status,
    players: row.players,
    prizePool: row.prize_pool,
    entryStake: row.entry_stake,
    timeLeft: row.time_left,
    chain: row.chain,
    messages: normalizeMessages(row.messages),
  };
}

function createInputToRow(input: CustomMinorityMarketInput): MarketRow {
  const marketId = input.id ?? `mw-${input.contractGameId.toString()}`;
  const messages: GameRoom['messages'] = [
    { user: 'system', text: 'This social market was created on-chain first, then its metadata and images were stored in Supabase.', time: 'now' },
    { user: 'system', text: `Stake token ${input.stakeTokenAddress}${input.confidentialTokenAddress ? ` - confidential wrapper ${input.confidentialTokenAddress}` : ''}`, time: 'now' },
  ];

  return {
    id: marketId,
    game_id: 'minority-win',
    contract_game_id: input.contractGameId.toString(),
    name: toTitle(input.question),
    prompt: input.question,
    question_image_url: input.questionImageUrl ?? null,
    options: input.options.map((option) => ({
      label: option.label,
      votes: 0,
      pct: 0,
      imageUrl: option.imageUrl,
    })),
    status: 'OPEN',
    players: 0,
    prize_pool: input.prizePool ?? '0',
    entry_stake: input.entryStake,
    time_left: input.timeLeft,
    chain: input.chain ?? 'ETH',
    messages,
    stake_token_address: input.stakeTokenAddress,
    confidential_token_address: input.confidentialTokenAddress ?? null,
  };
}

function ensureSupabaseMarkets() {
  if (!supabase) {
    throw new Error('Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return supabase;
}

function marketTableError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('row-level security')) {
    return 'Supabase blocked market metadata by RLS. Run frontend/supabase/minority-win-markets.sql in your Supabase SQL editor.';
  }

  if (normalized.includes('does not exist') || normalized.includes('schema cache') || normalized.includes('could not find the table')) {
    return 'Supabase cannot see public.minority_win_markets yet. Run frontend/supabase/minority-win-markets.sql in your Supabase SQL editor, then wait a few seconds for the schema cache reload.';
  }

  return message;
}

export function useMinorityWinMarkets() {
  const [remoteMarkets, setRemoteMarkets] = useState<GameRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const client = ensureSupabaseMarkets();
      const { data, error: fetchError } = await client
        .from(MARKET_TABLE)
        .select('*')
        .eq('game_id', 'minority-win')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(marketTableError(fetchError.message));
      }

      setRemoteMarkets(((data ?? []) as MarketRow[]).map(rowToMarket));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load markets.');
      setRemoteMarkets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMarkets();
  }, [fetchMarkets]);

  const markets = useMemo(() => remoteMarkets, [remoteMarkets]);

  const createMarket = useCallback(async (input: CustomMinorityMarketInput) => {
    const client = ensureSupabaseMarkets();
    const row = createInputToRow(input);

    const { data, error: insertError } = await client
      .from(MARKET_TABLE)
      .insert(row)
      .select('*')
      .single();

    if (insertError) {
      throw new Error(marketTableError(insertError.message));
    }

    const market = rowToMarket(data as MarketRow);
    setRemoteMarkets((previous) => [market, ...previous.filter((existing) => existing.id !== market.id)]);
    return market;
  }, []);

  function getMarketById(id: string) {
    return markets.find((market) => market.id === id);
  }

  return {
    markets,
    customMarkets: markets,
    createMarket,
    getMarketById,
    isLoading,
    error,
    refetch: fetchMarkets,
  };
}
