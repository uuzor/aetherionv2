import { CitrineCube } from './CitrineCube';
import { Lock, Users, Coins, Zap } from 'lucide-react';

const pillars = [
  {
    icon: Lock,
    title: 'Privacy by default',
    desc: 'Zama FHE encrypts every game state. Stakes, votes, and moves are computed on-chain without ever being revealed to anyone — including us.',
  },
  {
    icon: Users,
    title: 'Social game rooms',
    desc: 'Each game runs in a live room where players chat, coordinate, and bluff. The social layer is the game layer — interaction drives the strategy.',
  },
  {
    icon: Coins,
    title: 'Stake & earn',
    desc: 'Real value on BNB and Ethereum. Stake to participate, win from the prize pool, and earn through on-chain payouts. No custodians, no intermediaries.',
  },
  {
    icon: Zap,
    title: 'Build your own',
    desc: 'A toolkit for deploying mini social games with encrypted logic. Compose voting, staking, and reveal mechanics into new game formats.',
  },
];

export function Games() {
  return (
    <section id="games" className="bg-carbon py-32">
      <div className="mx-auto max-w-page px-6">
        {/* Section label */}
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-block h-2 w-2 bg-citrine" />
          <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
            WHAT YOU CAN DO
          </span>
        </div>

        <div className="grid gap-16 lg:grid-cols-[40%_60%]">
          {/* Left: heading */}
          <div>
            <h2
              className="font-normal uppercase text-bone"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}
            >
              Mini games.<br />
              Max privacy.
            </h2>
            <p className="mt-6 max-w-sm text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
              UNEVENTFUL is a platform for short-form, high-stakes social games where
              privacy creates the gameplay. One game is live. More are coming.
            </p>

            <div className="mt-10">
              <CitrineCube size={80} glow="soft" rotate />
            </div>
          </div>

          {/* Right: pillars */}
          <div className="grid gap-px sm:grid-cols-2">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="group border border-chalk/10 bg-graphite/20 p-8 transition-colors hover:bg-graphite/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-chalk/10 bg-carbon">
                  <pillar.icon size={20} className="text-citrine" />
                </div>
                <h3 className="mt-5 font-medium text-bone" style={{ fontSize: '20px', lineHeight: 1.3 }}>
                  {pillar.title}
                </h3>
                <p className="mt-3 text-stone" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
