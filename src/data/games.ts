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

export type GameOption = {
  label: string;
  votes: number;
  pct: number;
  imageUrl?: string;
};

export type GameRoom = {
  id: string;
  gameId: string;
  contractGameId?: bigint;
  questionImageUrl?: string;
  isCustom?: boolean;
  name: string;
  prompt: string;
  options: GameOption[];
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
      "Players stake tokens to vote on a set of options. When the round closes, the option with the fewest votes wins. The minority splits the entire prize pool proportional to their stake. Every vote is encrypted on-chain via Zama FHE, so no one can see what you picked until reveal.",
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
      "Submit encrypted bids on-chain. No one can see your bid or anyone else's until the auction closes. Highest bid wins the item. Second-price rules mean you always pay the runner-up's price. Privacy removes the game theory and the MEV.",
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
      "On-chain voting where every ballot is encrypted until tally. No one can see who voted for what, or running totals, until the window closes. Sybil-resistant via stake. Built for DAOs and communities that need real privacy in decision-making.",
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
      "Two-player tic-tac-toe where moves are committed encrypted. Your opponent can't see your placement until you reveal. Turns the simplest game in the world into a bluffing puzzle and the board state is computed on encrypted data the whole way through.",
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
      "Bet on outcomes without revealing your position to the market. Encrypted order book means no front-running, no copy-trading, no whale watching. The price discovery happens on encrypted data and the truth only emerges at resolution.",
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
      "Enter a raffle where the participant list and ticket counts are encrypted. The winner is selected on encrypted state and revealed publicly, provably fair, verifiably random, and completely private until the draw.",
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
    contractGameId: 0n,
    name: 'Best Footballer Right Now',
    prompt: 'Who is the best footballer right now?',
    options: [
      { label: 'Lionel Messi', votes: 142, pct: 58 },
      { label: 'Cristiano Ronaldo', votes: 61, pct: 25 },
      { label: 'Victor Osimhen', votes: 42, pct: 17 },
    ],
    status: 'VOTING',
    players: 203,
    prizePool: '24.8 BNB',
    entryStake: '0.12 BNB',
    timeLeft: '02h 14m',
    chain: 'ETH',
    messages: [
      { user: 'anon_4f2a', text: 'messi is still the safest take', time: '14:02' },
      { user: 'anon_9c1b', text: 'ronaldo minority side might print', time: '14:05' },
      { user: 'anon_2d8e', text: 'osimhen is the outsider play', time: '14:08' },
      { user: 'anon_7a3f', text: 'everyone is overthinking this board', time: '14:12' },
    ],
  },
];

export function getGame(id: string): GameMeta | undefined {
  return games.find((g) => g.id === id);
}

export function getRoom(id: string): GameRoom | undefined {
  return minorityWinRooms.find((r) => r.id === id);
}
