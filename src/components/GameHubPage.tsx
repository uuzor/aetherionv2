import { useState } from 'react';
import { Users, Coins, Layers, Lock, Trophy, Vote, MessageCircle, ArrowUpRight, Plus } from 'lucide-react';
import { getGame, minorityWinRooms, type GameRoom } from '../data/games';
import { navigate } from '../router';
import { CitrineCube, Constellation } from './CitrineCube';

const statusStyles: Record<GameRoom['status'], { dot: string; text: string }> = {
  OPEN: { dot: 'bg-citrine', text: 'text-citrine' },
  VOTING: { dot: 'bg-citrine', text: 'text-citrine' },
  REVEALING: { dot: 'bg-citrine', text: 'text-citrine' },
  CLOSED: { dot: 'bg-stone', text: 'text-stone' },
};

function RoomRow({ room }: { room: GameRoom }) {
  const s = statusStyles[room.status];
  const isClosed = room.status === 'CLOSED';

  return (
    <button
      onClick={() => navigate(`/game/${room.gameId}/room/${room.id}`)}
      className="group flex w-full items-center gap-6 border border-chalk/10 bg-graphite/20 p-5 text-left transition-all hover:border-citrine/30 hover:bg-graphite/40"
    >
      {/* Status dot */}
      <div className="flex flex-col items-center gap-1">
        <span className={`inline-block h-2 w-2 rounded-full ${s.dot} ${!isClosed ? 'animate-pulse' : ''}`} />
      </div>

      {/* Name + prompt */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-bone" style={{ fontSize: '18px', lineHeight: 1.3 }}>
            {room.name}
          </h3>
          <span className={`font-medium uppercase tracking-[0.032em] ${s.text}`} style={{ fontSize: '10px' }}>
            {room.status}
          </span>
        </div>
        <p className="mt-1 truncate text-stone" style={{ fontSize: '14px' }}>
          {room.prompt}
        </p>
      </div>

      {/* Options preview */}
      <div className="hidden items-center gap-2 md:flex">
        {room.options.slice(0, 4).map((opt, i) => (
          <div
            key={i}
            className="flex h-8 items-center rounded-btn border border-chalk/10 bg-carbon px-2.5"
            title={`${opt.label}: ${opt.pct}%`}
          >
            <span className="text-stone" style={{ fontSize: '11px' }}>{opt.pct}%</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="hidden items-center gap-6 lg:flex">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-stone" />
          <span className="text-stone" style={{ fontSize: '12px' }}>{room.players}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coins size={12} className="text-stone" />
          <span className="text-stone" style={{ fontSize: '12px' }}>{room.prizePool}</span>
        </div>
      </div>

      {/* Time + chain */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium text-bone" style={{ fontSize: '14px' }}>{room.timeLeft}</div>
          <div className="text-stone" style={{ fontSize: '10px' }}>{room.chain}</div>
        </div>
        <ArrowUpRight size={16} className="text-citrine opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </button>
  );
}

export function GameHubPage({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const [filter, setFilter] = useState('all');

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

  const rooms = gameId === 'minority-win' ? minorityWinRooms : [];
  const filteredRooms = filter === 'all' ? rooms : rooms.filter((r) => r.status === filter);
  const isLive = game.status === 'LIVE';

  const stats = [
    { icon: Users, label: 'PLAYERS', value: game.players },
    { icon: Coins, label: 'PRIZE POOL', value: game.prizePool },
    { icon: Layers, label: 'ROUNDS PLAYED', value: game.rounds },
    { icon: Lock, label: 'PRIVACY', value: 'ZAMA FHE' },
  ];

  const howItWorks = [
    { icon: Coins, label: 'STAKE', title: 'Stake to vote', desc: 'Pick an option and stake tokens. Your choice is encrypted on-chain — no one sees it.' },
    { icon: MessageCircle, label: 'INTERACT', title: 'Discuss in rooms', desc: 'Chat with other players in real-time. Bluff, coordinate, or misdirect. The social layer is the game.' },
    { icon: Vote, label: 'REVEAL', title: 'Round closes', desc: 'Encrypted votes are tallied when the timer ends. The option with the fewest votes wins.' },
    { icon: Trophy, label: 'EARN', title: 'Minority takes all', desc: 'Winners split the prize pool proportional to stake. The fewer who picked right, the bigger each share.' },
  ];

  const roomFilters = ['all', 'OPEN', 'VOTING', 'REVEALING', 'CLOSED'];

  return (
    <div className="min-h-screen bg-carbon pt-32 pb-24">
      <div className="mx-auto max-w-page px-6">
        {/* Hero header */}
        <div className="grid items-center gap-16 lg:grid-cols-[55%_45%]">
          {/* Left: info */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className={`inline-block h-2 w-2 rounded-full ${isLive ? 'bg-citrine' : 'bg-stone'}`} />
              <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                {game.status} · {game.category}
              </span>
            </div>

            <h1
              className="font-normal uppercase text-bone"
              style={{ fontSize: 'clamp(40px, 7vw, 80px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}
            >
              {game.name}
            </h1>
            <p className="mt-4 text-citrine" style={{ fontSize: '20px', lineHeight: 1.3 }}>
              {game.tagline}
            </p>
            <p className="mt-6 max-w-lg text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
              {game.description}
            </p>

            {/* Chains */}
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
            </div>

            {/* CTA */}
            {isLive && (
              <button
                onClick={() => {
                  if (rooms.length > 0) navigate(`/game/${gameId}/room/${rooms[0].id}`);
                }}
                className="mt-8 flex items-center gap-2 rounded-btn bg-citrine px-8 py-4 font-medium text-carbon transition-opacity hover:opacity-90"
                style={{ fontSize: '16px' }}
              >
                <span className="inline-block h-2 w-2 bg-carbon" />
                Play now
              </button>
            )}
          </div>

          {/* Right: visual */}
          <div className="flex justify-center">
            <Constellation />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-chalk/10 bg-chalk/10 sm:grid-cols-4">
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

        {/* How it works */}
        <div className="mt-24">
          <div className="mb-8 flex items-center gap-3">
            <span className="inline-block h-2 w-2 bg-citrine" />
            <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
              HOW IT WORKS
            </span>
          </div>
          <h2
            className="font-normal uppercase text-bone"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}
          >
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

        {/* Rooms list */}
        {rooms.length > 0 && (
          <div className="mt-24">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-block h-2 w-2 bg-citrine" />
                  <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                    LIVE ROOMS
                  </span>
                </div>
                <h2
                  className="font-normal uppercase text-bone"
                  style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}
                >
                  Active rounds
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {roomFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-btn border px-3 py-1.5 font-medium uppercase tracking-[0.032em] transition-colors ${
                      filter === f
                        ? 'border-citrine/40 bg-citrine/10 text-citrine'
                        : 'border-chalk/10 bg-graphite/20 text-stone hover:text-bone'
                    }`}
                    style={{ fontSize: '10px' }}
                  >
                    {f === 'all' ? 'ALL' : f}
                  </button>
                ))}
                <button className="flex items-center gap-1.5 rounded-btn bg-citrine px-4 py-1.5 font-medium text-carbon transition-opacity hover:opacity-90" style={{ fontSize: '10px' }}>
                  <Plus size={12} />
                  CREATE ROOM
                </button>
              </div>
            </div>

            <div className="space-y-px">
              {filteredRooms.map((room) => (
                <RoomRow key={room.id} room={room} />
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="flex flex-col items-center justify-center border border-chalk/10 bg-graphite/20 py-16 text-center">
                <CitrineCube size={50} glow="soft" />
                <p className="mt-4 text-stone" style={{ fontSize: '14px' }}>No rooms match this filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
