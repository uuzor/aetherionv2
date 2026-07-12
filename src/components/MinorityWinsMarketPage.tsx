import { useEffect, useMemo, useState } from 'react';
import { Users, Coins, Lock, Trophy, Clock, Send, Check, ChevronLeft, MessageCircle, Vote } from 'lucide-react';
import { useAccount } from 'wagmi';
import { getGame, type GameRoom } from '../data/games';
import { navigate } from '../router';
import { CitrineCube } from './CitrineCube';
import { useApproveToken,  useMinorityGame, useSubmitPick, useTokenAllowance, useTokenMetadata } from '../lib/hooks';
import { formatTokenAmount, MINORITY_WINS_ADDRESS, statusLabel } from '../lib/minority';
import { useMinorityWinMarkets } from '../lib/minority-win-markets';

const statusStyles: Record<GameRoom['status'], { dot: string; text: string; label: string }> = {
  OPEN: { dot: 'bg-citrine', text: 'text-citrine', label: 'OPEN FOR ENTRY' },
  VOTING: { dot: 'bg-citrine', text: 'text-citrine', label: 'VOTING IN PROGRESS' },
  REVEALING: { dot: 'bg-citrine', text: 'text-citrine', label: 'REVEALING RESULTS' },
  CLOSED: { dot: 'bg-stone', text: 'text-stone', label: 'ROUND CLOSED' },
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

function ImageTile({ label, imageUrl, large = false }: { label: string; imageUrl?: string; large?: boolean }) {
  if (imageUrl) {
    return <img src={imageUrl} alt={label} crossOrigin="anonymous" className={`${large ? 'h-56' : 'h-40'} w-full object-cover`} />;
  }

  return (
    <div className={`${large ? 'h-56' : 'h-40'} flex w-full items-center justify-center bg-carbon text-bone`} style={{ fontSize: large ? '18px' : '14px' }}>
      {label}
    </div>
  );
}

export function MinorityWinsMarketPage({ marketId }: { marketId: string }) {
  const game = getGame('minority-win');
  const { markets, isLoading: marketsLoading, error: marketsError } = useMinorityWinMarkets();
  const room = markets.find((market) => market.id === marketId);
  const isLiveContract = room?.contractGameId !== undefined;
  const contractGameId = room?.contractGameId ?? 0n;

  const { address, isConnected } = useAccount();
  const { gameInfo, hasJoined, clearCounts, refetch } = useMinorityGame(contractGameId, undefined, isLiveContract);
  const { symbol, decimals } = useTokenMetadata(gameInfo?.stakeToken, isLiveContract);
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(gameInfo?.stakeToken, address, MINORITY_WINS_ADDRESS, isLiveContract);
  const { approve, isApproving } = useApproveToken();
  const { submitPick, isSubmitting } = useSubmitPick();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(room?.messages ?? []);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setMessages(room?.messages ?? []);
  }, [room?.id]);

  const readyToApprove = isLiveContract && gameInfo && allowance !== undefined && allowance < gameInfo.stake;
  const contractStatus = isLiveContract ? mapContractStatus(gameInfo?.status) : undefined;
  const resolvedStatus = contractStatus ?? room?.status ?? 'OPEN';
  const s = statusStyles[resolvedStatus];
  const isClosed = resolvedStatus === 'CLOSED';
  const isRevealing = resolvedStatus === 'REVEALING';

  const minorityIdx = useMemo(() => {
    if (!room) return -1;
    return room.options.reduce((min, opt, i, arr) => (opt.votes < arr[min].votes ? i : min), 0);
  }, [room]);

  if (marketsLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-carbon pt-32">
        <CitrineCube size={60} glow="soft" />
        <p className="mt-6 text-stone" style={{ fontSize: '16px' }}>Loading market from Supabase...</p>
      </div>
    );
  }

  if (!game || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-carbon pt-32">
        <CitrineCube size={60} glow="soft" />
        <p className="mt-6 text-stone" style={{ fontSize: '16px' }}>{marketsError ?? 'Market not found.'}</p>
        <button onClick={() => navigate('/game/minority-win')} className="mt-4 text-citrine" style={{ fontSize: '14px' }}>
          Back to MinorityWin
        </button>
      </div>
    );
  }

  const handleVote = () => {
    if (selectedOption === null || !stakeAmount) return;
    setHasVoted(true);
  };

  async function handleApprove() {
    if (!gameInfo) return;
    setFeedback('Preparing approval transaction...');

    try {
      await approve(gameInfo.stakeToken, MINORITY_WINS_ADDRESS, gameInfo.stake);
      await refetchAllowance();
      setFeedback('Allowance updated. You can now submit your encrypted vote.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Approval failed.');
    }
  }

  async function handleSubmitLiveVote() {
    if (selectedOption === null) return;
    setFeedback('Encrypting your vote and submitting to the contract...');

    try {
      console.log(gameInfo)
      await submitPick(contractGameId, selectedOption);
      await Promise.all([refetch(), refetchAllowance()]);
      setFeedback('Vote encrypted and submitted on-chain.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Vote failed.');
    }
  }

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { user: 'you', text: chatInput.trim(), time: 'now' }]);
    setChatInput('');
  };

  const livePrizePool = isLiveContract && gameInfo && decimals !== undefined ? `${formatTokenAmount(gameInfo.pot, decimals)} ${symbol ?? 'token'}` : room.prizePool;
  const liveStake = isLiveContract && gameInfo && decimals !== undefined ? `${formatTokenAmount(gameInfo.stake, decimals)} ${symbol ?? 'token'}` : room.entryStake;
  const livePlayers = isLiveContract && gameInfo ? Number(gameInfo.playerCount) : room.players;
  const liveTime = isLiveContract && gameInfo ? new Date(Number(gameInfo.deadline) * 1000).toLocaleString() : room.timeLeft;
  const showResults = isClosed || isRevealing || (!!clearCounts && isLiveContract);
  const buttonBusy = isApproving || isSubmitting;

  return (
    <div className="min-h-screen bg-carbon pt-28 pb-24">
      <div className="mx-auto max-w-page px-6">
        <button onClick={() => navigate('/game/minority-win')} className="mb-8 flex items-center gap-1.5 text-stone transition-colors hover:text-bone">
          <ChevronLeft size={16} />
          <span className="font-medium uppercase tracking-[0.027em]" style={{ fontSize: '12px' }}>
            Back to {game.name}
          </span>
        </button>

        <div className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-chalk/10 bg-graphite/20 p-8">
            <div className="flex items-center gap-3">
              <span className={`inline-block h-2 w-2 rounded-full ${s.dot} ${!isClosed ? 'animate-pulse' : ''}`} />
              <span className={`font-medium uppercase tracking-[0.032em] ${s.text}`} style={{ fontSize: '10px' }}>
                {isLiveContract && gameInfo ? statusLabel(gameInfo.status).toUpperCase() : s.label}
              </span>
              {room.isCustom ? (
                <span className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                  CUSTOM MARKET
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 font-medium text-bone" style={{ fontSize: '32px', lineHeight: 1.1 }}>
              {room.name}
            </h1>
            <p className="mt-2 text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
              {gameInfo?.question ?? room.prompt}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {room.options.slice(0, 3).map((option) => (
                <div key={option.label} className="overflow-hidden border border-chalk/10 bg-carbon">
                  <ImageTile label={option.label} imageUrl={option.imageUrl} />
                  <div className="border-t border-chalk/10 px-3 py-3 text-bone" style={{ fontSize: '13px' }}>
                    {option.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden border border-chalk/10 bg-graphite/20">
            <ImageTile label={room.prompt} imageUrl={room.questionImageUrl ?? room.options[0]?.imageUrl} large />
            <div className="flex flex-wrap gap-6 p-6">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-citrine" />
                <span className="font-medium text-bone" style={{ fontSize: '16px' }}>{liveTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-stone" />
                <span className="text-stone" style={{ fontSize: '14px' }}>{livePlayers} players</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins size={14} className="text-stone" />
                <span className="text-stone" style={{ fontSize: '14px' }}>{livePrizePool}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-citrine" />
                <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
                  {room.chain} � FHE
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="border border-chalk/10 bg-graphite/20 p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-chalk/10 bg-carbon">
                    <Vote size={18} className="text-citrine" />
                  </div>
                  <div>
                    <h2 className="font-medium text-bone" style={{ fontSize: '20px', lineHeight: 1.3 }}>Cast your vote</h2>
                    <p className="text-stone" style={{ fontSize: '12px' }}>
                      {hasJoined ? 'Vote already submitted on-chain' : hasVoted ? 'Vote submitted' : 'Select the person or option you back'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-btn border border-chalk/10 bg-carbon px-3 py-1.5">
                  <Lock size={10} className="text-citrine" />
                  <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>ENCRYPTED</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {room.options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isWinner = isClosed && i === minorityIdx;
                  const resultCount = clearCounts && i < clearCounts.length ? clearCounts[i] : opt.votes;
                  const resultPct = clearCounts ? Math.round((Number(resultCount) / Math.max(Number(clearCounts[0] + clearCounts[1] + clearCounts[2]), 1)) * 100) : opt.pct;

                  return (
                    <button
                      key={opt.label}
                      onClick={() => !hasJoined && !hasVoted && !isClosed && setSelectedOption(i)}
                      disabled={hasJoined || hasVoted || isClosed}
                      className={`overflow-hidden border text-left transition-all ${isSelected ? 'border-citrine bg-citrine/10' : isWinner ? 'border-citrine/40 bg-citrine/5' : 'border-chalk/10 bg-carbon hover:border-chalk/20'} ${(hasJoined || hasVoted || isClosed) ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="relative">
                        <ImageTile label={opt.label} imageUrl={opt.imageUrl} />
                        {showResults ? (
                          <div className="absolute left-3 top-3 rounded-btn bg-carbon/90 px-2 py-1 text-bone" style={{ fontSize: '11px' }}>
                            {resultPct}%
                          </div>
                        ) : null}
                      </div>
                      <div className="space-y-2 border-t border-chalk/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className={`font-medium ${isWinner ? 'text-citrine' : 'text-bone'}`} style={{ fontSize: '15px' }}>{opt.label}</span>
                          {isSelected && !showResults ? <Check size={16} className="text-citrine" /> : null}
                          {isWinner ? <Trophy size={16} className="text-citrine" /> : null}
                        </div>
                        {showResults ? (
                          <p className="text-stone" style={{ fontSize: '12px' }}>{resultCount} votes</p>
                        ) : (
                          <p className="text-stone" style={{ fontSize: '12px' }}>{hasJoined ? 'Encrypted choice submitted' : 'Tap to choose this side'}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!isClosed && !hasJoined && !hasVoted && (
                <div className="mt-6 border-t border-chalk/10 pt-6">
                  {isLiveContract ? (
                    <>
                      <div className="flex items-center justify-between rounded-card border border-chalk/10 bg-carbon px-4 py-3">
                        <span className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>FIXED ENTRY STAKE</span>
                        <span className="font-medium text-bone" style={{ fontSize: '16px' }}>{liveStake}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {!isConnected ? (
                          <button onClick={() => navigate('/explore')} className="flex items-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon transition-opacity hover:opacity-90" style={{ fontSize: '16px' }}>
                            <span className="inline-block h-2 w-2 bg-carbon" />
                            Connect wallet above to play
                          </button>
                        ) : readyToApprove ? (
                          <button onClick={handleApprove} disabled={buttonBusy || selectedOption === null} className="flex items-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" style={{ fontSize: '16px' }}>
                            <span className="inline-block h-2 w-2 bg-carbon" />
                            {isApproving ? 'Approving...' : `Approve ${liveStake}`}
                          </button>
                        ) : (
                          <button onClick={handleSubmitLiveVote} disabled={buttonBusy || selectedOption === null} className="flex items-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" style={{ fontSize: '16px' }}>
                            <span className="inline-block h-2 w-2 bg-carbon" />
                            {isSubmitting ? 'Submitting...' : 'Submit encrypted vote'}
                          </button>
                        )}
                      </div>
                      <p className="mt-3 text-stone" style={{ fontSize: '12px', lineHeight: 1.5 }}>
                        This market is wired to the deployed MinorityWins contract. Select an option, approve the fixed stake, then submit your encrypted pick.
                      </p>
                    </>
                  ) : (
                    <>
                      <label className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>STAKE AMOUNT</label>
                      <div className="mt-3 flex gap-3">
                        <div className="relative flex-1">
                          <input type="text" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder={room.entryStake} className="w-full rounded-btn border border-chalk/10 bg-carbon py-3 pl-4 pr-16 text-bone placeholder-stone outline-none transition-colors focus:border-citrine/30" style={{ fontSize: '16px' }} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>{room.chain === 'BNB' ? 'BNB' : 'ETH'}</span>
                        </div>
                        <button onClick={handleVote} disabled={selectedOption === null || !stakeAmount} className="flex items-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" style={{ fontSize: '16px' }}>
                          <span className="inline-block h-2 w-2 bg-carbon" />
                          Save mock vote
                        </button>
                      </div>
                      <p className="mt-3 text-stone" style={{ fontSize: '12px', lineHeight: 1.5 }}>
                        This custom market is social-first for now. Its images are stored in Supabase and the market metadata lives in the frontend.
                      </p>
                    </>
                  )}
                </div>
              )}

              {(hasVoted || hasJoined) && !isClosed ? (
                <div className="mt-6 flex items-center gap-3 border-t border-chalk/10 pt-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-citrine"><Check size={16} className="text-carbon" /></div>
                  <div>
                    <p className="font-medium text-bone" style={{ fontSize: '14px' }}>{hasJoined ? 'Vote encrypted and stored on-chain' : 'Vote saved'}</p>
                    <p className="text-stone" style={{ fontSize: '12px' }}>Waiting for round to close. The minority option wins the pool.</p>
                  </div>
                </div>
              ) : null}

              {isClosed ? (
                <div className="mt-6 border-t border-chalk/10 pt-6">
                  <div className="flex items-center gap-3">
                    <Trophy size={20} className="text-citrine" />
                    <div>
                      <p className="font-medium text-citrine" style={{ fontSize: '16px' }}>{room.options[minorityIdx]?.label} � minority wins</p>
                      <p className="text-stone" style={{ fontSize: '12px' }}>Winners split {livePrizePool} proportional to stake.</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {feedback ? <div className="mt-4 rounded-card border border-chalk/10 bg-carbon p-4 text-stone" style={{ fontSize: '12px' }}>{feedback}</div> : null}
            </div>

            <div className="border border-chalk/10 bg-graphite/20 p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-chalk/10 bg-carbon"><Coins size={18} className="text-citrine" /></div>
                <div>
                  <h2 className="font-medium text-bone" style={{ fontSize: '20px', lineHeight: 1.3 }}>Prize pool</h2>
                  <p className="text-stone" style={{ fontSize: '12px' }}>How the {livePrizePool} gets distributed</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-chalk/10 pb-4"><span className="text-stone" style={{ fontSize: '14px' }}>Total pool</span><span className="font-medium text-bone" style={{ fontSize: '16px' }}>{livePrizePool}</span></div>
                <div className="flex items-center justify-between border-b border-chalk/10 pb-4"><span className="text-stone" style={{ fontSize: '14px' }}>Entry stake</span><span className="font-medium text-bone" style={{ fontSize: '16px' }}>{liveStake}</span></div>
                <div className="flex items-center justify-between border-b border-chalk/10 pb-4"><span className="text-stone" style={{ fontSize: '14px' }}>Active players</span><span className="font-medium text-bone" style={{ fontSize: '16px' }}>{livePlayers}</span></div>
                <div className="flex items-center justify-between"><span className="text-stone" style={{ fontSize: '14px' }}>Protocol fee</span><span className="font-medium text-bone" style={{ fontSize: '16px' }}>2%</span></div>
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-btn border border-citrine/20 bg-citrine/5 p-4">
                <Lock size={14} className="text-citrine" />
                <p className="text-stone" style={{ fontSize: '12px', lineHeight: 1.5 }}>{isLiveContract ? 'Payouts and encrypted votes are controlled by the deployed MinorityWins contract on Sepolia.' : 'This custom market uses Supabase image storage and frontend metadata until you wire it to a deployed on-chain round.'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col border border-chalk/10 bg-graphite/20">
            <div className="flex items-center justify-between border-b border-chalk/10 p-5">
              <div className="flex items-center gap-3"><MessageCircle size={18} className="text-citrine" /><h2 className="font-medium text-bone" style={{ fontSize: '16px' }}>Market room</h2></div>
              <div className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-citrine animate-pulse" /><span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>{livePlayers} LIVE</span></div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: '400px' }}>
              {messages.map((msg, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2"><span className="font-medium text-citrine" style={{ fontSize: '11px' }}>{msg.user}</span><span className="text-stone" style={{ fontSize: '10px' }}>{msg.time}</span></div>
                  <p className="text-bone" style={{ fontSize: '14px', lineHeight: 1.4 }}>{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-chalk/10 p-4">
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Say something..." className="flex-1 rounded-btn border border-chalk/10 bg-carbon py-2.5 px-3 text-bone placeholder-stone outline-none transition-colors focus:border-citrine/30" style={{ fontSize: '14px' }} />
                <button onClick={handleSend} className="flex items-center justify-center rounded-btn bg-citrine px-4 py-2.5 text-carbon transition-opacity hover:opacity-90"><Send size={14} /></button>
              </div>
              <p className="mt-2 text-stone" style={{ fontSize: '10px' }}>Messages are public. Votes are not.</p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3"><span className="inline-block h-2 w-2 bg-citrine" /><span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>MORE MARKETS</span></div>
          <h2 className="font-medium text-bone" style={{ fontSize: '24px', lineHeight: 1.2 }}>Other active markets</h2>
          <div className="mt-6 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {markets.filter((market) => market.id !== room.id).slice(0, 3).map((market) => (
              <button key={market.id} onClick={() => navigate(`/game/minority-win/market/${market.id}`)} className="group border border-chalk/10 bg-graphite/20 p-5 text-left transition-all hover:border-citrine/30 hover:bg-graphite/40">
                <div className="overflow-hidden border border-chalk/10 bg-carbon">
                  <ImageTile label={market.prompt} imageUrl={market.questionImageUrl ?? market.options[0]?.imageUrl} />
                </div>
                <div className="mt-4 flex items-center justify-between"><h3 className="font-medium text-bone" style={{ fontSize: '16px' }}>{market.name}</h3><span className={`inline-block h-1.5 w-1.5 rounded-full ${market.status === 'CLOSED' ? 'bg-stone' : 'bg-citrine'}`} /></div>
                <p className="mt-1 truncate text-stone" style={{ fontSize: '13px' }}>{market.prompt}</p>
                <div className="mt-4 flex items-center gap-4"><span className="text-stone" style={{ fontSize: '12px' }}>{market.players} players</span><span className="text-stone" style={{ fontSize: '12px' }}>{market.prizePool}</span><span className="ml-auto text-citrine" style={{ fontSize: '12px' }}>{market.timeLeft}</span></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
