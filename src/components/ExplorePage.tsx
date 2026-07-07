import { useState } from 'react';
import { Users, Coins, Layers, Lock, Search, ArrowUpRight } from 'lucide-react';
import { games, type GameMeta, type GameStatus } from '../data/games';
import { navigate } from '../router';
import { CitrineCube } from './CitrineCube';

const statusColors: Record<GameStatus, string> = {
  'LIVE': 'text-citrine',
  'BETA': 'text-citrine',
  'COMING SOON': 'text-stone',
};

const filters: { label: string; value: string }[] = [
  { label: 'ALL', value: 'all' },
  { label: 'LIVE', value: 'LIVE' },
  { label: 'BETA', value: 'BETA' },
  { label: 'COMING SOON', value: 'COMING SOON' },
];

function GameCard({ game }: { game: GameMeta }) {
  const isLive = game.status === 'LIVE';
  return (
    <button
      onClick={() => navigate(`/game/${game.id}`)}
      className="group flex flex-col border border-chalk/10 bg-graphite/20 p-6 text-left transition-all duration-300 hover:border-citrine/30 hover:bg-graphite/40"
    >
      {/* Top row: cube + status */}
      <div className="flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-card border border-chalk/10 bg-carbon">
          <CitrineCube size={36} glow="soft" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${isLive ? 'bg-citrine' : 'bg-stone'}`} />
          <span className={`font-medium uppercase tracking-[0.032em] ${statusColors[game.status]}`} style={{ fontSize: '10px' }}>
            {game.status}
          </span>
        </div>
      </div>

      {/* Name + tagline */}
      <h3 className="mt-5 font-medium text-bone" style={{ fontSize: '20px', lineHeight: 1.3 }}>
        {game.name}
      </h3>
      <p className="mt-2 text-stone" style={{ fontSize: '14px', lineHeight: 1.5 }}>
        {game.tagline}
      </p>

      {/* Category + chains */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-btn border border-chalk/10 bg-carbon px-2.5 py-1 font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
          {game.category}
        </span>
        {game.chains.map((chain) => (
          <span key={chain} className="rounded-btn border border-chalk/10 bg-carbon px-2.5 py-1 font-medium uppercase tracking-[0.032em] text-bone/70" style={{ fontSize: '10px' }}>
            {chain}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-6 flex items-center gap-6 border-t border-chalk/10 pt-4">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-stone" />
          <span className="text-stone" style={{ fontSize: '12px' }}>{game.players}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coins size={12} className="text-stone" />
          <span className="text-stone" style={{ fontSize: '12px' }}>{game.prizePool}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-citrine opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight size={14} />
        </div>
      </div>
    </button>
  );
}

export function ExplorePage() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = games.filter((g) => {
    const matchesFilter = filter === 'all' || g.status === filter;
    const matchesQuery = query === '' || g.name.toLowerCase().includes(query.toLowerCase()) || g.tagline.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-carbon pt-32 pb-24">
      <div className="mx-auto max-w-page px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-block h-2 w-2 bg-citrine" />
            <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
              EXPLORE GAMES
            </span>
          </div>
          <h1
            className="font-normal uppercase text-bone"
            style={{ fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}
          >
            Pick your game.
          </h1>
          <p className="mt-4 max-w-lg text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
            Every game on UNEVENTFUL runs on Zama's fully homomorphic encryption.
            Your moves stay private until reveal. One is live — more are coming.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-btn border px-4 py-2 font-medium uppercase tracking-[0.032em] transition-colors ${
                  filter === f.value
                    ? 'border-citrine/40 bg-citrine/10 text-citrine'
                    : 'border-chalk/10 bg-graphite/20 text-stone hover:text-bone'
                }`}
                style={{ fontSize: '10px' }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full rounded-btn border border-chalk/10 bg-graphite/20 py-2.5 pl-9 pr-4 text-bone placeholder-stone outline-none transition-colors focus:border-citrine/30 sm:w-64"
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CitrineCube size={60} glow="soft" />
            <p className="mt-6 text-stone" style={{ fontSize: '16px' }}>No games match your search.</p>
          </div>
        )}

        {/* Privacy banner */}
        <div className="mt-16 flex items-center gap-4 border border-chalk/10 bg-graphite/20 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-chalk/10 bg-carbon">
            <Lock size={20} className="text-citrine" />
          </div>
          <div>
            <h3 className="font-medium text-bone" style={{ fontSize: '16px' }}>
              Every game is encrypted end-to-end
            </h3>
            <p className="mt-1 text-stone" style={{ fontSize: '14px', lineHeight: 1.5 }}>
              Stakes, votes, and moves are computed on-chain via Zama FHE. No one sees your strategy until the round reveals.
            </p>
          </div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <Layers size={14} className="text-citrine" />
            <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
              ZAMA FHE POWERED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
