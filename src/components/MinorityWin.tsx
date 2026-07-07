import { Users, Coins, Trophy, MessageCircle, Lock, Vote } from 'lucide-react';

const steps = [
  {
    icon: Coins,
    label: 'STAKE',
    title: 'Players stake to vote',
    desc: 'Each player stakes tokens on one of several options. Stakes are encrypted on-chain via Zama FHE — no one can see what you picked.',
  },
  {
    icon: MessageCircle,
    label: 'INTERACT',
    title: 'Discuss in game rooms',
    desc: 'Live rooms let players coordinate, bluff, and debate. Social dynamics drive the strategy — the minority is where the value lives.',
  },
  {
    icon: Vote,
    label: 'REVEAL',
    title: 'Round closes & reveals',
    desc: 'When the round ends, encrypted votes are tallied. The option with the fewest votes wins. The minority splits the entire prize pool.',
  },
  {
    icon: Trophy,
    label: 'EARN',
    title: 'Minority takes the pool',
    desc: 'Winners split the prize pool proportional to their stake. The fewer who picked right, the bigger each winner\'s share.',
  },
];

const stats = [
  { value: 'LIVE', label: 'STATUS' },
  { value: 'BNB + ETH', label: 'CHAINS' },
  { value: 'FHE', label: 'PRIVACY' },
  { value: '∞', label: 'PLAYERS / ROOM' },
];

export function MinorityWin() {
  return (
    <section id="minoritywin" className="relative overflow-hidden bg-carbon py-32">
      {/* Subtle grid */}
      <div className="grid-bg absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto max-w-page px-6">
        {/* Section label */}
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-block h-2 w-2 bg-citrine" />
          <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
            LIVE GAME · NOW PLAYING
          </span>
        </div>

        <div className="grid items-start gap-16 lg:grid-cols-[45%_55%]">
          {/* Left: title + description */}
          <div>
            <h2
              className="font-normal uppercase text-bone"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}
            >
              Minority<br />
              <span className="text-citrine">Win.</span>
            </h2>
            <p className="mt-6 max-w-md text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
              Stake to vote. The option with the fewest votes takes the entire prize pool.
              It's a game of social deduction where being in the minority is the win condition —
              and every move stays private until reveal.
            </p>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-chalk/10 bg-chalk/10 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-carbon p-4">
                  <div className="font-medium text-citrine" style={{ fontSize: '20px' }}>
                    {stat.value}
                  </div>
                  <div className="mt-1 font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="#play"
              className="mt-8 inline-flex items-center gap-2 rounded-btn bg-citrine px-8 py-4 font-medium text-carbon transition-opacity hover:opacity-90"
              style={{ fontSize: '16px' }}
            >
              <span className="inline-block h-2 w-2 bg-carbon" />
              Enter a room
            </a>
          </div>

          {/* Right: how it works steps */}
          <div className="space-y-px">
            {steps.map((step, i) => (
              <div
                key={step.label}
                className="group flex gap-6 border border-chalk/10 bg-graphite/20 p-6 transition-colors hover:bg-graphite/40"
              >
                {/* Step number */}
                <div className="flex flex-col items-center">
                  <span className="font-medium text-citrine" style={{ fontSize: '12px' }}>
                    0{i + 1}
                  </span>
                  <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full border border-chalk/10 bg-carbon">
                    <step.icon size={18} className="text-citrine" />
                  </div>
                  {i < steps.length - 1 && <div className="mt-2 h-8 w-px bg-chalk/10" />}
                </div>
                {/* Content */}
                <div className="flex-1 pb-2">
                  <span className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                    {step.label}
                  </span>
                  <h3 className="mt-1 font-medium text-bone" style={{ fontSize: '18px', lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-stone" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature pills row */}
        <div className="mt-16 flex flex-wrap items-center gap-3">
          {[
            { icon: Lock, text: 'ENCRYPTED STAKES' },
            { icon: Users, text: 'LIVE GAME ROOMS' },
            { icon: Trophy, text: 'ON-CHAIN PAYOUTS' },
            { icon: Vote, text: 'MEV-RESISTANT VOTING' },
          ].map((pill) => (
            <span
              key={pill.text}
              className="flex items-center gap-2 rounded-btn border border-chalk/10 bg-graphite/30 px-4 py-2 font-medium uppercase tracking-[0.032em] text-citrine"
              style={{ fontSize: '10px' }}
            >
              <pill.icon size={12} />
              {pill.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
