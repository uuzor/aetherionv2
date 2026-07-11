import { useState } from 'react';
import { Users, Coins, Layers, Lock, Trophy, Vote, MessageCircle, ArrowUpRight, Plus, Radio } from 'lucide-react';
import { parseUnits, type Address } from 'viem';
import { getGame, type GameRoom } from '../data/games';
import { navigate } from '../router';
import { CitrineCube, Constellation } from './CitrineCube';
import { useCreateGame, useMinorityGame, useTokenMetadata, useTokenRegistryPairs } from '../lib/hooks';
import { formatTokenAmount, statusLabel } from '../lib/minority';
import { useMinorityWinMarkets } from '../lib/minority-win-markets';
import { uploadMarketImage } from '../lib/supabase';
import { CreateMinorityMarketModal } from './CreateMinorityMarketModal';

const statusStyles: Record<GameRoom['status'], { dot: string; text: string }> = {
  OPEN: { dot: 'bg-citrine', text: 'text-citrine' },
  VOTING: { dot: 'bg-citrine', text: 'text-citrine' },
  REVEALING: { dot: 'bg-citrine', text: 'text-citrine' },
  CLOSED: { dot: 'bg-stone', text: 'text-stone' },
};

function mapContractStatus(status?: number): GameRoom['status'] {
  switch (status) {
    case 0:
      return 'VOTING';
    case 1:
      return 'REVEALING';
    case 2:
      return 'CLOSED';
    default:
      return 'OPEN';
  }
}

function fallbackTile(label: string) {
  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden border border-chalk/10 bg-carbon text-bone" style={{ fontSize: '10px' }}>
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

function RoomRow({ room }: { room: GameRoom }) {
  const liveStatus = room.contractGameId !== undefined;
  const { gameInfo } = useMinorityGame(room.contractGameId ?? 0n, undefined, liveStatus);
  const { decimals, symbol } = useTokenMetadata(gameInfo?.stakeToken, liveStatus);

  const resolvedStatus = liveStatus ? mapContractStatus(gameInfo?.status) : room.status;
  const s = statusStyles[resolvedStatus];
  const isClosed = resolvedStatus === 'CLOSED';
  const playerCount = liveStatus && gameInfo ? Number(gameInfo.playerCount) : room.players;
  const prizePool =
    liveStatus && gameInfo && decimals !== undefined ? `${formatTokenAmount(gameInfo.pot, decimals)} ${symbol ?? 'token'}` : room.prizePool;
  const timeLeft = liveStatus && gameInfo ? new Date(Number(gameInfo.deadline) * 1000).toLocaleString() : room.timeLeft;

  return (
    <button
      onClick={() => navigate(`/game/${room.gameId}/market/${room.id}`)}
      className="group flex w-full items-center gap-6 border border-chalk/10 bg-graphite/20 p-5 text-left transition-all hover:border-citrine/30 hover:bg-graphite/40"
    >
      <div className="flex flex-col items-center gap-1">
        <span className={`inline-block h-2 w-2 rounded-full ${s.dot} ${!isClosed ? 'animate-pulse' : ''}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-bone" style={{ fontSize: '18px', lineHeight: 1.3 }}>
            {room.name}
          </h3>
          <span className={`font-medium uppercase tracking-[0.032em] ${s.text}`} style={{ fontSize: '10px' }}>
            {liveStatus && gameInfo ? statusLabel(gameInfo.status) : resolvedStatus}
          </span>
          {room.isCustom ? (
            <span className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
              CUSTOM
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-stone" style={{ fontSize: '14px' }}>
          {gameInfo?.question ?? room.prompt}
        </p>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        {room.options.slice(0, 3).map((opt, i) => (
          <div key={i} title={opt.label}>
            {opt.imageUrl ? (
              <img src={opt.imageUrl} alt={opt.label} crossOrigin="anonymous" className="h-10 w-10 overflow-hidden border border-chalk/10 object-cover" />
            ) : (
              fallbackTile(opt.label)
            )}
          </div>
        ))}
      </div>

      <div className="hidden items-center gap-6 lg:flex">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-stone" />
          <span className="text-stone" style={{ fontSize: '12px' }}>{playerCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coins size={12} className="text-stone" />
          <span className="text-stone" style={{ fontSize: '12px' }}>{prizePool}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium text-bone" style={{ fontSize: '14px' }}>{timeLeft}</div>
          <div className="text-stone" style={{ fontSize: '10px' }}>{room.chain}</div>
        </div>
        <ArrowUpRight size={16} className="text-citrine opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </button>
  );
}

export function MinorityWinsHubPage() {
  const game = getGame('minority-win');
  const [filter, setFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { markets, createMarket, isLoading: marketsLoading, error: marketsError } = useMinorityWinMarkets();
  const { createGame } = useCreateGame();
  const { pairs: tokenPairs, isLoading: tokenRegistryLoading } = useTokenRegistryPairs(createOpen);
  const liveGameId = markets.find((market) => market.contractGameId !== undefined)?.contractGameId;
  const { gameInfo } = useMinorityGame(liveGameId ?? 0n, undefined, liveGameId !== undefined);
  const { decimals, symbol } = useTokenMetadata(gameInfo?.stakeToken, liveGameId !== undefined);

  const registryToken0 = tokenPairs[0]?.tokenAddress;
  const registryToken1 = tokenPairs[1]?.tokenAddress;
  const registryToken2 = tokenPairs[2]?.tokenAddress;
  const registryToken3 = tokenPairs[3]?.tokenAddress;
  const registryToken4 = tokenPairs[4]?.tokenAddress;

  const tokenMeta0 = useTokenMetadata(registryToken0, createOpen && Boolean(registryToken0));
  const tokenMeta1 = useTokenMetadata(registryToken1, createOpen && Boolean(registryToken1));
  const tokenMeta2 = useTokenMetadata(registryToken2, createOpen && Boolean(registryToken2));
  const tokenMeta3 = useTokenMetadata(registryToken3, createOpen && Boolean(registryToken3));
  const tokenMeta4 = useTokenMetadata(registryToken4, createOpen && Boolean(registryToken4));

  const tokenOptions = tokenPairs.slice(0, 5).map((pair, index) => {
    const meta = index === 0 ? tokenMeta0 : index === 1 ? tokenMeta1 : index === 2 ? tokenMeta2 : index === 3 ? tokenMeta3 : tokenMeta4;
    const shortAddress = `${pair.tokenAddress.slice(0, 6)}...${pair.tokenAddress.slice(-4)}`;
    const symbolLabel = meta.symbol ? meta.symbol : shortAddress;

    return {
      address: pair.tokenAddress,
      label: `${symbolLabel} � ${shortAddress}`,
      decimals: meta.decimals,
      confidentialTokenAddress: pair.confidentialTokenAddress,
    };
  });

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-carbon pt-32">
        <CitrineCube size={60} glow="soft" />
        <p className="mt-6 text-stone" style={{ fontSize: '16px' }}>Game not found.</p>
        <button onClick={() => navigate('/explore')} className="mt-4 text-citrine" style={{ fontSize: '14px' }}>
          Back to explore
        </button>
      </div>
    );
  }

  const rooms = markets;
  const filteredRooms = filter === 'all' ? rooms : rooms.filter((r) => r.status === filter);
  const isLive = game.status === 'LIVE';
  const livePot = gameInfo && decimals !== undefined ? `${formatTokenAmount(gameInfo.pot, decimals)} ${symbol ?? 'token'}` : game.prizePool;
  const livePlayers = gameInfo ? gameInfo.playerCount.toString() : game.players;
  const liveDeadline = gameInfo ? new Date(Number(gameInfo.deadline) * 1000).toLocaleString() : 'Waiting for market';

  const stats = [
    { icon: Users, label: 'PLAYERS', value: livePlayers },
    { icon: Coins, label: 'PRIZE POOL', value: livePot },
    { icon: Layers, label: 'MARKETS', value: rooms.length.toString() },
    { icon: Lock, label: 'PRIVACY', value: 'ZAMA FHE' },
  ];

  const howItWorks = [
    { icon: Coins, label: 'STAKE', title: 'Stake to vote', desc: 'Pick an option and stake tokens. Your choice is encrypted on-chain and hidden until reveal.' },
    { icon: MessageCircle, label: 'SOCIAL', title: 'Build visual markets', desc: 'Each market can carry question art plus option pictures so people react to recognizable faces and moments.' },
    { icon: Vote, label: 'REVEAL', title: 'Round closes', desc: 'Encrypted votes are tallied when the timer ends. The option with the fewest votes wins.' },
    { icon: Trophy, label: 'EARN', title: 'Minority takes all', desc: 'Winners split the prize pool proportional to stake. The fewer who picked right, the bigger each share.' },
  ];

  const roomFilters = ['all', 'OPEN', 'VOTING', 'REVEALING', 'CLOSED'];

  async function handleCreateMarket(payload: {
    question: string;
    questionImage: File | null;
    options: Array<{ label: string; image: File }>;
    stakeToken: Address;
    stakeAmount: string;
    durationHours: string;
  }) {
    setIsCreating(true);

    try {
      const selectedToken = tokenOptions.find((token) => token.address === payload.stakeToken);
      if (!selectedToken) {
        throw new Error('Selected stake token is not available in the registry.');
      }

      if (selectedToken.decimals === undefined) {
        throw new Error('Token decimals are still loading. Try again in a moment.');
      }

      const durationSeconds = Math.floor(Number(payload.durationHours) * 60 * 60);
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        throw new Error('Duration must be greater than zero.');
      }

      const parsedStake = parseUnits(payload.stakeAmount, selectedToken.decimals);
      const { gameId } = await createGame(payload.question, payload.stakeToken, parsedStake, durationSeconds);
      const marketId = `mw-${gameId.toString()}`;
      const tokenSymbol = selectedToken.label.split(' � ')[0];

      const questionImageUpload = payload.questionImage
        ? await uploadMarketImage(payload.questionImage, marketId, 'question')
        : null;

      const uploadedOptions = await Promise.all(
        payload.options.map(async (option, index) => {
          const upload = await uploadMarketImage(option.image, marketId, `option-${index + 1}`);
          return {
            label: option.label,
            imageUrl: upload.publicUrl,
          };
        })
      );

      const createdMarket = await createMarket({
        id: marketId,
        contractGameId: gameId,
        question: payload.question,
        questionImageUrl: questionImageUpload?.publicUrl,
        stakeTokenAddress: payload.stakeToken,
        confidentialTokenAddress: selectedToken.confidentialTokenAddress,
        entryStake: `${payload.stakeAmount} ${tokenSymbol}`,
        prizePool: `0 ${tokenSymbol}`,
        timeLeft: `${payload.durationHours}h`,
        options: uploadedOptions,
      });

      setCreateOpen(false);
      navigate(`/game/minority-win/market/${createdMarket.id}`);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-carbon pt-32 pb-24">
        <div className="mx-auto max-w-page px-6">
          <div className="grid items-center gap-16 lg:grid-cols-[55%_45%]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className={`inline-block h-2 w-2 rounded-full ${isLive ? 'bg-citrine' : 'bg-stone'}`} />
                <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                  {game.status} � {game.category}
                </span>
              </div>

              <h1 className="font-normal uppercase text-bone" style={{ fontSize: 'clamp(40px, 7vw, 80px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}>
                {game.name}
              </h1>
              <p className="mt-4 text-citrine" style={{ fontSize: '20px', lineHeight: 1.3 }}>
                {game.tagline}
              </p>
              <p className="mt-6 max-w-lg text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
                {game.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {game.chains.map((chain) => (
                  <span key={chain} className="rounded-btn border border-chalk/10 bg-graphite/30 px-3 py-1.5 font-medium uppercase tracking-[0.032em] text-bone/70" style={{ fontSize: '10px' }}>
                    {chain}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 rounded-btn border border-chalk/10 bg-graphite/30 px-3 py-1.5 font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                  <Lock size={10} />
                  ZAMA FHE
                </span>
                <span className="flex items-center gap-1.5 rounded-btn border border-chalk/10 bg-graphite/30 px-3 py-1.5 font-medium uppercase tracking-[0.032em] text-bone/70" style={{ fontSize: '10px' }}>
                  <Radio size={10} />
                  LIVE MARKET {liveDeadline}
                </span>
              </div>

              {rooms[0] ? (
                <button
                  onClick={() => navigate(`/game/minority-win/market/${rooms[0].id}`)}
                  className="mt-8 flex items-center gap-2 rounded-btn bg-citrine px-8 py-4 font-medium text-carbon transition-opacity hover:opacity-90"
                  style={{ fontSize: '16px' }}
                >
                  <span className="inline-block h-2 w-2 bg-carbon" />
                  Open live market
                </button>
              ) : null}
            </div>

            <div className="flex justify-center">
              <Constellation />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-chalk/10 bg-chalk/10 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-carbon p-6">
                <div className="flex items-center gap-2">
                  <stat.icon size={14} className="text-citrine" />
                  <span className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                    {stat.label}
                  </span>
                </div>
                <div className="mt-2 font-medium text-bone" style={{ fontSize: '24px', lineHeight: 1.2 }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
           <div className="mt-12">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-block h-2 w-2 bg-citrine" />
                  <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                    SOCIAL MARKETS
                  </span>
                </div>
                <h2 className="font-normal uppercase text-bone" style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}>
                  Active rounds
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {roomFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-btn border px-3 py-1.5 font-medium uppercase tracking-[0.032em] transition-colors ${filter === f ? 'border-citrine/40 bg-citrine/10 text-citrine' : 'border-chalk/10 bg-graphite/20 text-stone hover:text-bone'}`}
                    style={{ fontSize: '10px' }}
                  >
                    {f === 'all' ? 'ALL' : f}
                  </button>
                ))}
                <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-btn bg-citrine px-4 py-1.5 font-medium text-carbon transition-opacity hover:opacity-90" style={{ fontSize: '10px' }}>
                  <Plus size={12} />
                  CREATE MARKET
                </button>
              </div>
            </div>

            {marketsError ? (
              <div className="mb-4 border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-stone" style={{ fontSize: '13px' }}>
                {marketsError}
              </div>
            ) : null}

            {marketsLoading ? (
              <div className="mb-4 border border-chalk/10 bg-graphite/20 px-4 py-3 text-stone" style={{ fontSize: '13px' }}>
                Loading markets from Supabase...
              </div>
            ) : null}

            <div className="space-y-px">
              {filteredRooms.map((room) => (
                <RoomRow key={room.id} room={room} />
              ))}
            </div>

            {!marketsLoading && filteredRooms.length === 0 && (
              <div className="flex flex-col items-center justify-center border border-chalk/10 bg-graphite/20 py-16 text-center">
                <CitrineCube size={50} glow="soft" />
                <p className="mt-4 text-stone" style={{ fontSize: '14px' }}>No markets match this filter.</p>
              </div>
            )}
          </div>

          <div className="mt-12">
            <div className="mb-8 flex items-center gap-3">
              <span className="inline-block h-2 w-2 bg-citrine" />
              <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                HOW IT WORKS
              </span>
            </div>
            <h2 className="font-normal uppercase text-bone" style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}>
              Four steps.<br />One encrypted round.
            </h2>

            <div className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step, i) => (
                <div key={step.label} className="border border-chalk/10 bg-graphite/20 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-chalk/10 bg-carbon">
                      <step.icon size={18} className="text-citrine" />
                    </div>
                    <span className="font-medium text-citrine" style={{ fontSize: '12px' }}>0{i + 1}</span>
                  </div>
                  <span className="mt-4 block font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                    {step.label}
                  </span>
                  <h3 className="mt-1 font-medium text-bone" style={{ fontSize: '16px', lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-stone" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

         
        </div>
      </div>

      <CreateMinorityMarketModal
        open={createOpen}
        isSubmitting={isCreating}
        tokenPairs={tokenPairs}
        tokenOptions={tokenOptions.map((token) => ({ address: token.address, label: token.label }))}
        tokenRegistryLoading={tokenRegistryLoading}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateMarket}
      />
    </>
  );
}
