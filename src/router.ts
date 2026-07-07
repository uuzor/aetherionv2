import { useEffect, useState } from 'react';

export type Route =
  | { name: 'landing' }
  | { name: 'explore' }
  | { name: 'game'; gameId: string }
  | { name: 'room'; gameId: string; roomId: string }
  | { name: 'minorityWinHub' }
  | { name: 'minorityWinMarket'; marketId: string };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '');
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'landing' };
  if (parts[0] === 'explore') return { name: 'explore' };
  if (parts[0] === 'game' && parts[1] === 'minority-win' && parts[2] === 'market' && parts[3]) {
    return { name: 'minorityWinMarket', marketId: parts[3] };
  }
  if (parts[0] === 'game' && parts[1] === 'minority-win') return { name: 'minorityWinHub' };
  if (parts[0] === 'game' && parts[1] && parts[2] === 'room' && parts[3]) {
    return { name: 'room', gameId: parts[1], roomId: parts[3] };
  }
  if (parts[0] === 'game' && parts[1]) return { name: 'game', gameId: parts[1] };
  return { name: 'landing' };
}

export function navigate(path: string) {
  window.location.hash = path;
  window.scrollTo(0, 0);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route;
}
