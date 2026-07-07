import { useEffect, useState } from 'react';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { navigate } from '../router';

type Props = {
  breadcrumbs?: { label: string; path: string }[];
};

export function AppNav({ breadcrumbs = [] }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'EXPLORE', path: '/explore' },
    { label: 'MINORITYWIN', path: '/game/minority-win' },
    { label: 'PRIVACY', path: '/' },
    { label: 'DOCS', path: '/' },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`flex w-full max-w-page items-center justify-between rounded-nav px-6 py-3 transition-all duration-300 ${
          scrolled ? 'border border-chalk/10 bg-carbon/80 backdrop-blur-md' : 'border border-chalk/10 bg-carbon/60 backdrop-blur-sm'
        }`}
      >
        {/* Left: wordmark + breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <span className="inline-block h-3 w-3 rotate-45 bg-citrine" />
            <span className="font-medium tracking-[0.027em] text-bone" style={{ fontSize: '20px' }}>
              UNEVENTFUL
            </span>
          </button>

          {breadcrumbs.length > 0 && (
            <div className="hidden items-center gap-2 md:flex">
              {breadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ChevronLeft size={14} className="text-stone" />
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="font-medium uppercase tracking-[0.027em] text-stone transition-colors hover:text-bone"
                    style={{ fontSize: '12px' }}
                  >
                    {crumb.label}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className="font-medium uppercase tracking-[0.027em] text-bone/80 transition-colors hover:text-bone"
              style={{ fontSize: '12px' }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => navigate('/')}
            className="font-medium uppercase tracking-[0.032em] text-bone/70 transition-colors hover:text-bone"
            style={{ fontSize: '12px' }}
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon transition-opacity hover:opacity-90"
            style={{ fontSize: '14px' }}
          >
            <span className="inline-block h-2 w-2 bg-carbon" />
            Connect Wallet
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-bone lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute left-4 right-4 top-20 rounded-card border border-chalk/10 bg-carbon/95 p-6 backdrop-blur-md lg:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  navigate(link.path);
                  setMobileOpen(false);
                }}
                className="text-left font-medium uppercase tracking-[0.027em] text-bone/80"
                style={{ fontSize: '14px' }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate('/explore');
                setMobileOpen(false);
              }}
              className="mt-2 flex items-center justify-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon"
              style={{ fontSize: '14px' }}
            >
              <span className="inline-block h-2 w-2 bg-carbon" />
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
