import { Navbar } from './components/Navbar';
import { AppNav } from './components/AppNav';
import { Hero } from './components/Hero';
import { LogoCloud } from './components/LogoCloud';
import { SplitFeature } from './components/SplitFeature';
import { ReversalBand } from './components/ReversalBand';
import { Games } from './components/Games';
import { MinorityWin } from './components/MinorityWin';
import { Footer } from './components/Footer';
import { ExplorePage } from './components/ExplorePage';
import { GameHubPage } from './components/GameHubPage';
import { RoomPage } from './components/RoomPage';
import { useRoute, navigate } from './router';
import { getGame } from './data/games';
import { useEffect } from 'react';

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <SplitFeature />
        <ReversalBand />
        <Games />
        <MinorityWin />
      </main>
      <Footer />
    </>
  );
}

function App() {
  const route = useRoute();

  // Update "Launch App" / "Play" links on the landing page to route into the app
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href="#play"]') as HTMLAnchorElement | null;
      if (anchor) {
        e.preventDefault();
        navigate('/explore');
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  if (route.name === 'landing') {
    return (
      <div className="min-h-screen bg-carbon text-bone">
        <LandingPage />
      </div>
    );
  }

  if (route.name === 'explore') {
    return (
      <div className="min-h-screen bg-carbon text-bone">
        <AppNav breadcrumbs={[]} />
        <ExplorePage />
      </div>
    );
  }

  if (route.name === 'game') {
    const game = getGame(route.gameId);
    return (
      <div className="min-h-screen bg-carbon text-bone">
        <AppNav
          breadcrumbs={[
            { label: 'Explore', path: '/explore' },
            { label: game?.name ?? route.gameId, path: `/game/${route.gameId}` },
          ]}
        />
        <GameHubPage gameId={route.gameId} />
      </div>
    );
  }

  if (route.name === 'room') {
    const game = getGame(route.gameId);
    return (
      <div className="min-h-screen bg-carbon text-bone">
        <AppNav
          breadcrumbs={[
            { label: 'Explore', path: '/explore' },
            { label: game?.name ?? route.gameId, path: `/game/${route.gameId}` },
            { label: 'Room', path: `/game/${route.gameId}/room/${route.roomId}` },
          ]}
        />
        <RoomPage gameId={route.gameId} roomId={route.roomId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon text-bone">
      <LandingPage />
    </div>
  );
}

export default App;
