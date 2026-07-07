import { useState } from 'react';
import { Users, Coins, Lock, Trophy, Clock, Send, Check, ChevronLeft, MessageCircle, Vote } from 'lucide-react';
import { getGame, getRoom, minorityWinRooms, type GameRoom } from '../data/games';
import { navigate } from '../router';
import { CitrineCube } from './CitrineCube';

const statusStyles: Record<GameRoom['status'], { dot: string; text: string; label: string }> = {
  OPEN: { dot: 'bg-citrine', text: 'text-citrine', label: 'OPEN FOR ENTRY' },
  VOTING: { dot: 'bg-citrine', text: 'text-citrine', label: 'VOTING IN PROGRESS' },
  REVEALING: { dot: 'bg-citrine', text: 'text-citrine', label: 'REVEALING RESULTS' },
  CLOSED: { dot: 'bg-stone', text: 'text-stone', label: 'ROUND CLOSED' },
};

export function RoomPage({ gameId, roomId }: { gameId: string; roomId: string }) {
  const game = getGame(gameId);
  const room = getRoom(roomId);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(room?.messages ?? []);

  if (!game || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-carbon pt-32">
        <CitrineCube size={60} glow="soft" />
        <p className="mt-6 text-stone" style={{ fontSize: '16px' }}>Room not found.</p>
        <button onClick={() => navigate(`/game/${gameId}`)} className="mt-4 text-citrine" style={{ fontSize: '14px' }}>
          Back to {game?.name ?? 'games'}
        </button>
      </div>
    );
  }

  const s = statusStyles[room.status];
  const isClosed = room.status === 'CLOSED';
  const isRevealing = room.status === 'REVEALING';

  const handleVote = () => {
    if (selectedOption === null || !stakeAmount) return;
    setHasVoted(true);
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { user: 'you', text: chatInput.trim(), time: 'now' }]);
    setChatInput('');
  };

  // Find minority winner on closed rounds
  const minorityIdx = isClosed ? room.options.reduce((min, opt, i, arr) => (opt.votes < arr[min].votes ? i : min), 0) : -1;

  return (
    <div className="min-h-screen bg-carbon pt-28 pb-24">
      <div className="mx-auto max-w-page px-6">
        {/* Back link */}
        <button
          onClick={() => navigate(`/game/${gameId}`)}
          className="mb-8 flex items-center gap-1.5 text-stone transition-colors hover:text-bone"
        >
          <ChevronLeft size={16} />
          <span className="font-medium uppercase tracking-[0.027em]" style={{ fontSize: '12px' }}>
            Back to {game.name}
          </span>
        </button>

        {/* Room header */}
        <div className="mb-10 flex flex-col gap-6 border border-chalk/10 bg-graphite/20 p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className={`inline-block h-2 w-2 rounded-full ${s.dot} ${!isClosed ? 'animate-pulse' : ''}`} />
              <span className={`font-medium uppercase tracking-[0.032em] ${s.text}`} style={{ fontSize: '10px' }}>
                {s.label}
              </span>
            </div>
            <h1 className="mt-3 font-medium text-bone" style={{ fontSize: '32px', lineHeight: 1.1 }}>
              {room.name}
            </h1>
            <p className="mt-2 text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
              {room.prompt}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 lg:flex-col lg:items-end lg:gap-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-citrine" />
              <span className="font-medium text-bone" style={{ fontSize: '16px' }}>{room.timeLeft}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-stone" />
              <span className="text-stone" style={{ fontSize: '14px' }}>{room.players} players</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins size={14} className="text-stone" />
              <span className="text-stone" style={{ fontSize: '14px' }}>{room.prizePool}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-citrine" />
              <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                {room.chain} · FHE
              </span>
            </div>
          </div>
        </div>

        {/* Main grid: voting + sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: voting panel */}
          <div className="space-y-6">
            {/* Vote card */}
            <div className="border border-chalk/10 bg-graphite/20 p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-chalk/10 bg-carbon">
                    <Vote size={18} className="text-citrine" />
                  </div>
                  <div>
                    <h2 className="font-medium text-bone" style={{ fontSize: '20px', lineHeight: 1.3 }}>
                      Cast your vote
                    </h2>
                    <p className="text-stone" style={{ fontSize: '12px' }}>
                      {hasVoted ? 'Vote submitted — encrypted on-chain' : 'Select an option and stake to vote'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-btn border border-chalk/10 bg-carbon px-3 py-1.5">
                  <Lock size={10} className="text-citrine" />
                  <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                    ENCRYPTED
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {room.options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isWinner = isClosed && i === minorityIdx;
                  const showResults = isClosed || isRevealing;

                  return (
                    <button
                      key={i}
                      onClick={() => !hasVoted && !isClosed && setSelectedOption(i)}
                      disabled={hasVoted || isClosed}
                      className={`relative w-full overflow-hidden rounded-card border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-citrine bg-citrine/10'
                          : isWinner
                          ? 'border-citrine/40 bg-citrine/5'
                          : 'border-chalk/10 bg-carbon hover:border-chalk/20'
                      } ${hasVoted || isClosed ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {/* Vote bar background */}
                      {showResults && (
                        <div
                          className={`absolute inset-y-0 left-0 ${isWinner ? 'bg-citrine/10' : 'bg-graphite/40'}`}
                          style={{ width: `${opt.pct}%` }}
                        />
                      )}

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isSelected && !showResults && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-citrine">
                              <Check size={12} className="text-carbon" />
                            </div>
                          )}
                          {!isSelected && !showResults && (
                            <div className="h-5 w-5 rounded-full border border-chalk/20" />
                          )}
                          {showResults && (
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isWinner ? 'border-citrine bg-citrine' : 'border-chalk/20'}`}>
                              {isWinner && <Trophy size={10} className="text-carbon" />}
                            </div>
                          )}
                          <span className={`font-medium ${isWinner ? 'text-citrine' : 'text-bone'}`} style={{ fontSize: '16px' }}>
                            {opt.label}
                          </span>
                        </div>

                        {showResults ? (
                          <div className="flex items-center gap-3">
                            <span className="text-stone" style={{ fontSize: '12px' }}>{opt.votes} votes</span>
                            <span className={`font-medium ${isWinner ? 'text-citrine' : 'text-bone'}`} style={{ fontSize: '16px' }}>
                              {opt.pct}%
                            </span>
                            {isWinner && (
                              <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                                MINORITY WIN
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone" style={{ fontSize: '12px' }}>
                            {hasVoted ? 'Encrypted' : '—'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Stake + submit */}
              {!isClosed && !hasVoted && (
                <div className="mt-6 border-t border-chalk/10 pt-6">
                  <label className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                    STAKE AMOUNT
                  </label>
                  <div className="mt-3 flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder={room.entryStake}
                        className="w-full rounded-btn border border-chalk/10 bg-carbon py-3 pl-4 pr-16 text-bone placeholder-stone outline-none transition-colors focus:border-citrine/30"
                        style={{ fontSize: '16px' }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                        {room.chain === 'BNB' ? 'BNB' : 'ETH'}
                      </span>
                    </div>
                    <button
                      onClick={handleVote}
                      disabled={selectedOption === null || !stakeAmount}
                      className="flex items-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ fontSize: '16px' }}
                    >
                      <span className="inline-block h-2 w-2 bg-carbon" />
                      Submit vote
                    </button>
                  </div>
                  <p className="mt-3 text-stone" style={{ fontSize: '12px', lineHeight: 1.5 }}>
                    Minimum entry: {room.entryStake}. Your stake and vote are encrypted via Zama FHE — no one can see your choice until reveal.
                  </p>
                </div>
              )}

              {/* Voted confirmation */}
              {hasVoted && !isClosed && (
                <div className="mt-6 flex items-center gap-3 border-t border-chalk/10 pt-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-citrine">
                    <Check size={16} className="text-carbon" />
                  </div>
                  <div>
                    <p className="font-medium text-bone" style={{ fontSize: '14px' }}>
                      Vote encrypted &amp; submitted
                    </p>
                    <p className="text-stone" style={{ fontSize: '12px' }}>
                      Waiting for round to close. The minority option wins the pool.
                    </p>
                  </div>
                </div>
              )}

              {/* Closed result */}
              {isClosed && (
                <div className="mt-6 border-t border-chalk/10 pt-6">
                  <div className="flex items-center gap-3">
                    <Trophy size={20} className="text-citrine" />
                    <div>
                      <p className="font-medium text-citrine" style={{ fontSize: '16px' }}>
                        {room.options[minorityIdx].label} — minority wins
                      </p>
                      <p className="text-stone" style={{ fontSize: '12px' }}>
                        {room.options[minorityIdx].votes} voters split {room.prizePool} proportional to stake.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prize pool breakdown */}
            <div className="border border-chalk/10 bg-graphite/20 p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-chalk/10 bg-carbon">
                  <Coins size={18} className="text-citrine" />
                </div>
                <div>
                  <h2 className="font-medium text-bone" style={{ fontSize: '20px', lineHeight: 1.3 }}>
                    Prize pool
                  </h2>
                  <p className="text-stone" style={{ fontSize: '12px' }}>
                    How the {room.prizePool} gets distributed
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-chalk/10 pb-4">
                  <span className="text-stone" style={{ fontSize: '14px' }}>Total pool</span>
                  <span className="font-medium text-bone" style={{ fontSize: '16px' }}>{room.prizePool}</span>
                </div>
                <div className="flex items-center justify-between border-b border-chalk/10 pb-4">
                  <span className="text-stone" style={{ fontSize: '14px' }}>Entry stake</span>
                  <span className="font-medium text-bone" style={{ fontSize: '16px' }}>{room.entryStake}</span>
                </div>
                <div className="flex items-center justify-between border-b border-chalk/10 pb-4">
                  <span className="text-stone" style={{ fontSize: '14px' }}>Active players</span>
                  <span className="font-medium text-bone" style={{ fontSize: '16px' }}>{room.players}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone" style={{ fontSize: '14px' }}>Protocol fee</span>
                  <span className="font-medium text-bone" style={{ fontSize: '16px' }}>2%</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-btn border border-citrine/20 bg-citrine/5 p-4">
                <Lock size={14} className="text-citrine" />
                <p className="text-stone" style={{ fontSize: '12px', lineHeight: 1.5 }}>
                  Payouts are computed on encrypted state and distributed automatically on-chain when the round reveals.
                </p>
              </div>
            </div>
          </div>

          {/* Right: chat sidebar */}
          <div className="flex flex-col border border-chalk/10 bg-graphite/20">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-chalk/10 p-5">
              <div className="flex items-center gap-3">
                <MessageCircle size={18} className="text-citrine" />
                <h2 className="font-medium text-bone" style={{ fontSize: '16px' }}>
                  Game room
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-citrine animate-pulse" />
                <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                  {room.players} LIVE
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: '400px' }}>
              {messages.map((msg, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-citrine" style={{ fontSize: '11px' }}>
                      {msg.user}
                    </span>
                    <span className="text-stone" style={{ fontSize: '10px' }}>{msg.time}</span>
                  </div>
                  <p className="text-bone" style={{ fontSize: '14px', lineHeight: 1.4 }}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-chalk/10 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Say something..."
                  className="flex-1 rounded-btn border border-chalk/10 bg-carbon py-2.5 px-3 text-bone placeholder-stone outline-none transition-colors focus:border-citrine/30"
                  style={{ fontSize: '14px' }}
                />
                <button
                  onClick={handleSend}
                  className="flex items-center justify-center rounded-btn bg-citrine px-4 py-2.5 text-carbon transition-opacity hover:opacity-90"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="mt-2 text-stone" style={{ fontSize: '10px' }}>
                Messages are public. Votes are not.
              </p>
            </div>
          </div>
        </div>

        {/* Other rooms */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-block h-2 w-2 bg-citrine" />
            <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
              MORE ROUNDS
            </span>
          </div>
          <h2 className="font-medium text-bone" style={{ fontSize: '24px', lineHeight: 1.2 }}>
            Other active rooms
          </h2>
          <div className="mt-6 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {minorityWinRooms
              .filter((r) => r.id !== room.id)
              .slice(0, 3)
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/game/${gameId}/room/${r.id}`)}
                  className="group border border-chalk/10 bg-graphite/20 p-5 text-left transition-all hover:border-citrine/30 hover:bg-graphite/40"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-bone" style={{ fontSize: '16px' }}>{r.name}</h3>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${r.status === 'CLOSED' ? 'bg-stone' : 'bg-citrine'}`} />
                  </div>
                  <p className="mt-1 truncate text-stone" style={{ fontSize: '13px' }}>{r.prompt}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-stone" style={{ fontSize: '12px' }}>{r.players} players</span>
                    <span className="text-stone" style={{ fontSize: '12px' }}>{r.prizePool}</span>
                    <span className="ml-auto text-citrine" style={{ fontSize: '12px' }}>{r.timeLeft}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
