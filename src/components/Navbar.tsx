import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'PLATFORM', href: '#platform' },
  { label: 'GAMES', href: '#games' },
  { label: 'PRIVACY', href: '#privacy' },
  { label: 'MINORITYWIN', href: '#minoritywin' },
  { label: 'DOCS', href: '#docs' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`flex w-full max-w-page items-center justify-between rounded-nav px-6 py-3 transition-all duration-300 ${
          scrolled ? 'border border-chalk/10 bg-carbon/80 backdrop-blur-md' : 'border border-transparent bg-transparent'
        }`}
      >
        {/* Wordmark */}
        <a href="#top" className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rotate-45 bg-citrine" />
          <span className="font-medium tracking-[0.027em] text-bone" style={{ fontSize: '20px' }}>
            UNEVENTFUL
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-medium uppercase tracking-[0.027em] text-bone/80 transition-colors hover:text-bone"
              style={{ fontSize: '12px' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#docs"
            className="font-medium uppercase tracking-[0.032em] text-bone/70 transition-colors hover:text-bone"
            style={{ fontSize: '12px' }}
          >
            Sign in
          </a>
          <a
            href="#play"
            className="flex items-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon transition-opacity hover:opacity-90"
            style={{ fontSize: '14px' }}
          >
            <span className="inline-block h-2 w-2 bg-carbon" />
            Launch App
          </a>
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
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-medium uppercase tracking-[0.027em] text-bone/80"
                style={{ fontSize: '14px' }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#play"
              className="mt-2 flex items-center justify-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon"
              style={{ fontSize: '14px' }}
            >
              <span className="inline-block h-2 w-2 bg-carbon" />
              Launch App
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
