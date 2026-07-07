export type GameStatus = 'LIVE' | 'COMING SOON' | 'BETA';

export type GameMeta = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: GameStatus;
  category: string;
  chains: string[];
  players: string;
  prizePool: string;
  rounds: string;
  accent: string;
};

export type GameRoom = {
  id: string;
  gameId: string;
  name: string;
  prompt: string;
  options: { label: string; votes: number; pct: number }[];
  status: 'OPEN' | 'VOTING' | 'REVEALING' | 'CLOSED';
  players: number;
  prizePool: string;
  entryStake: string;
  timeLeft: string;
  chain: 'BNB' | 'ETH';
  messages: { user: string; text: string; time: string }[];
};

export const games: GameMeta[] = [
  {
    id: 'minority-win',
    name: 'MinorityWin',
    tagline: 'Stake to vote. The minority takes the pool.',
    description:
      'Players stake tokens to vote on a set of options. When the round closes, the option with the fewest votes wins. The minority splits the entire prize pool — proportional to their stake. Every vote is encrypted on-chain via Zama FHE, so no one can see what you picked until reveal.',
    status: 'LIVE',
    category: 'SOCIAL DEDUCTION',
    chains: ['BNB', 'ETH'],
    players: '2,847',
    prizePool: '184.2 BNB',
    rounds: '12,408',
    accent: '#e5ff5d',
  },
  {
    id: 'blind-auction',
    name: 'BlindAuction',
    tagline: 'Sealed-bid auctions where bids stay encrypted.',
    description:
      'Submit encrypted bids on-chain. No one can see your bid — or anyone else\'s — until the auction closes. Highest bid wins the item. Second-price rules mean you always pay the runner-up\'s price. Privacy removes the game theory and the MEV.',
    status: 'COMING SOON',
    category: 'AUCTION',
    chains: ['ETH'],
    players: '—',
    prizePool: '—',
    rounds: '—',
    accent: '#e5ff5d',
  },
  {
    id: 'ghost-vote',
    name: 'GhostVote',
    tagline: 'Anonymous governance with encrypted ballots.',
    description:
      'On-chain voting where every ballot is encrypted until tally. No one can see who voted for what, or running totals, until the window closes. Sybil-resistant via stake. Built for DAOs and communities that need real privacy in decision-making.',
    status: 'BETA',
    category: 'GOVERNANCE',
    chains: ['BNB', 'ETH'],
    players: '412',
    prizePool: '—',
    rounds: '1,204',
    accent: '#e5ff5d',
  },
  {
    id: 'hidden-tic-tac-toe',
    name: 'HiddenTicTacToe',
    tagline: 'Classic grid. Encrypted moves. Bluffing allowed.',
    description:
      'Two-player tic-tac-toe where moves are committed encrypted. Your opponent can\'t see your placement until you reveal. Turns the simplest game in the world into a bluffing puzzle — and the board state is computed on encrypted data the whole way through.',
    status: 'COMING SOON',
    category: 'STRATEGY',
    chains: ['BNB'],
    players: '—',
    prizePool: '—',
    rounds: '—',
    accent: '#e5ff5d',
  },
  {
    id: 'dark-predict',
    name: 'DarkPredict',
    tagline: 'Prediction markets with private positions.',
    description:
      'Bet on outcomes without revealing your position to the market. Encrypted order book means no front-running, no copy-trading, no whale watching. The price discovery happens on encrypted data — the truth only emerges at resolution.',
    status: 'COMING SOON',
    category: 'PREDICTION',
    chains: ['ETH'],
    players: '—',
    prizePool: '—',
    rounds: '—',
    accent: '#e5ff5d',
  },
  {
    id: 'secret-raffle',
    name: 'SecretRaffle',
    tagline: 'Verifiable raffles with hidden entries.',
    description:
      'Enter a raffle where the participant list and ticket counts are encrypted. The winner is selected on encrypted state and revealed publicly — provably fair, verifiably random, and completely private until the draw.',
    status: 'BETA',
    category: 'RAFFLE',
    chains: ['BNB', 'ETH'],
    players: '891',
    prizePool: '12.4 BNB',
    rounds: '342',
    accent: '#e5ff5d',
  },
];

export const minorityWinRooms: GameRoom[] = [
  {
    id: 'mw-001',
    gameId: 'minority-win',
    name: 'Bull or Bear?',
    prompt: 'Where does ETH close by Friday?',
    options: [
      { label: 'Above $4,000', votes: 142, pct: 58 },
      { label: 'Below $4,000', votes: 61, pct: 25 },
      { label: 'Exactly $4,000', votes: 18, pct: 7 },
      { label: 'No trade', votes: 24, pct: 10 },
    ],
    status: 'VOTING',
    players: 203,
    prizePool: '24.8 BNB',
    entryStake: '0.12 BNB',
    timeLeft: '02h 14m',
    chain: 'BNB',
    messages: [
      { user: 'anon_4f2a', text: 'bull trap incoming', time: '14:02' },
      { user: 'anon_9c1b', text: 'below 4k is free money', time: '14:05' },
      { user: 'anon_2d8e', text: 'everyone is on above, minority is below', time: '14:08' },
      { user: 'anon_7a3f', text: 'exactly 4k is the real play', time: '14:12' },
    ],
  },
  {
    id: 'mw-002',
    gameId: 'minority-win',
    name: 'Best L2?',
    prompt: 'Which layer-2 wins Q3 by TVL?',
    options: [
      { label: 'Arbitrum', votes: 88, pct: 42 },
      { label: 'Base', votes: 76, pct: 36 },
      { label: 'Optimism', votes: 31, pct: 15 },
      { label: 'zkSync', votes: 15, pct: 7 },
    ],
    status: 'VOTING',
    players: 210,
    prizePool: '18.2 BNB',
    entryStake: '0.08 BNB',
    timeLeft: '05h 41m',
    chain: 'ETH',
    messages: [
      { user: 'anon_1b4c', text: 'base is eating everyone', time: '13:40' },
      { user: 'anon_5e9d', text: 'zksync minority gang', time: '13:55' },
      { user: 'anon_8f2a', text: 'arb vs base is a coin flip', time: '14:01' },
    ],
  },
  {
    id: 'mw-003',
    gameId: 'minority-win',
    name: 'Next Big Meme',
    prompt: 'Which token 10x first this month?',
    options: [
      { label: 'PEPE', votes: 54, pct: 38 },
      { label: 'WIF', votes: 48, pct: 34 },
      { label: 'BONK', votes: 22, pct: 15 },
      { label: 'FLOKI', votes: 18, pct: 13 },
    ],
    status: 'OPEN',
    players: 142,
    prizePool: '11.4 BNB',
    entryStake: '0.08 BNB',
    timeLeft: '11h 22m',
    chain: 'BNB',
    messages: [
      { user: 'anon_3c7b', text: 'wif has the momentum', time: '12:30' },
      { user: 'anon_6d1e', text: 'floki is the sleeper', time: '12:45' },
    ],
  },
  {
    id: 'mw-004',
    gameId: 'minority-win',
    name: 'BTC Halving Bet',
    prompt: 'BTC price 30 days post-halving?',
    options: [
      { label: 'Up 20%+', votes: 67, pct: 45 },
      { label: 'Flat ±5%', votes: 41, pct: 28 },
      { label: 'Down 10%+', votes: 28, pct: 19 },
      { label: 'Down 20%+', votes: 12, pct: 8 },
    ],
    status: 'REVEALING',
    players: 148,
    prizePool: '14.1 BNB',
    entryStake: '0.10 BNB',
    timeLeft: 'Revealing',
    chain: 'ETH',
    messages: [
      { user: 'anon_2a9f', text: 'flat is where the money is', time: '11:20' },
      { user: 'anon_4b7c', text: 'down 20 is insane but minority', time: '11:35' },
      { user: 'anon_9d3e', text: 'reveal incoming', time: '11:50' },
    ],
  },
  {
    id: 'mw-005',
    gameId: 'minority-win',
    name: 'DeFi King',
    prompt: 'Which protocol dominates 2026?',
    options: [
      { label: 'Uniswap', votes: 45, pct: 35 },
      { label: 'Aave', votes: 38, pct: 30 },
      { label: 'Lido', votes: 29, pct: 23 },
      { label: 'Curve', votes: 16, pct: 12 },
    ],
    status: 'OPEN',
    players: 128,
    prizePool: '9.6 BNB',
    entryStake: '0.08 BNB',
    timeLeft: '1d 04h',
    chain: 'BNB',
    messages: [
      { user: 'anon_1f5a', text: 'curve is the minority play', time: '10:15' },
      { user: 'anon_7c2b', text: 'aave is undervalued here', time: '10:30' },
    ],
  },
  {
    id: 'mw-006',
    gameId: 'minority-win',
    name: 'NFT Floor War',
    prompt: 'Which collection holds floor best this week?',
    options: [
      { label: 'Pudgy', votes: 72, pct: 41 },
      { label: 'Azuki', votes: 58, pct: 33 },
      { label: 'Milady', votes: 31, pct: 18 },
      { label: 'Bayc', votes: 14, pct: 8 },
    ],
    status: 'CLOSED',
    players: 175,
    prizePool: '16.8 BNB',
    entryStake: '0.10 BNB',
    timeLeft: 'Closed',
    chain: 'ETH',
    messages: [
      { user: 'anon_3e8d', text: 'bayc minority won it', time: '09:00' },
      { user: 'anon_5f1c', text: 'insane payout', time: '09:15' },
    ],
  },
];

export function getGame(id: string): GameMeta | undefined {
  return games.find((g) => g.id === id);
}

export function getRoom(id: string): GameRoom | undefined {
  return minorityWinRooms.find((r) => r.id === id);
}
