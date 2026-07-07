import { CitrineCube } from './CitrineCube';

const footerLinks = {
  PLATFORM: ['Overview', 'Privacy Protocol', 'Zama FHE', 'BNB Chain', 'Ethereum'],
  GAMES: ['MinorityWin', 'Game Rooms', 'Staking', 'Leaderboard', 'Upcoming'],
  DEVELOPERS: ['Documentation', 'SDK', 'Smart Contracts', 'API Reference', 'GitHub'],
  RESOURCES: ['Whitepaper', 'Blog', 'Community', 'Brand Kit', 'Contact'],
};

export function Footer() {
  return (
    <footer id="docs" className="border-t border-chalk/10 bg-carbon pt-24 pb-12">
      <div className="mx-auto max-w-page px-6">
        {/* Top: brand + CTA */}
        <div className="flex flex-col items-start justify-between gap-12 pb-16 lg:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <CitrineCube size={32} glow="soft" />
              <span className="font-medium tracking-[0.027em] text-bone" style={{ fontSize: '20px' }}>
                UNEVENTFUL
              </span>
            </div>
            <p className="mt-4 text-stone" style={{ fontSize: '14px', lineHeight: 1.5 }}>
              Privacy-powered social games on BNB and Ethereum. Built on Zama's fully homomorphic encryption.
              Play, interact, and earn — without exposing your strategy.
            </p>
          </div>

          <a
            href="#play"
            className="flex items-center gap-2 rounded-btn bg-citrine px-8 py-4 font-medium text-carbon transition-opacity hover:opacity-90"
            style={{ fontSize: '16px' }}
          >
            <span className="inline-block h-2 w-2 bg-carbon" />
            Launch the app
          </a>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 border-t border-chalk/10 pt-16 sm:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                {category}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-bone/70 transition-colors hover:text-bone"
                      style={{ fontSize: '14px' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-chalk/10 pt-8 sm:flex-row">
          <p className="text-stone" style={{ fontSize: '12px' }}>
            © 2026 UNEVENTFUL. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Twitter', 'Discord', 'GitHub', 'Telegram'].map((social) => (
              <a
                key={social}
                href="#"
                className="font-medium uppercase tracking-[0.032em] text-stone transition-colors hover:text-bone"
                style={{ fontSize: '10px' }}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
