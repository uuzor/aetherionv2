import { CitrineCube } from './CitrineCube';

const orbitNodes = [
  { label: 'BNB', angle: 0 },
  { label: 'ETH', angle: 45 },
  { label: 'ZAMA', angle: 90 },
  { label: 'FHE', angle: 135 },
  { label: 'BNB', angle: 180 },
  { label: 'ETH', angle: 225 },
  { label: 'ZAMA', angle: 270 },
  { label: 'FHE', angle: 315 },
];

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-carbon pt-32 pb-20">
      {/* Grid background */}
      <div className="grid-bg absolute inset-0 opacity-60" />

      {/* Radial glow behind cube */}
      <div
        className="absolute left-1/2 top-[38%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(229,255,93,0.08) 0%, transparent 70%)' }}
      />

      {/* Orbiting nodes — outer ring */}
      <div className="absolute left-1/2 top-[38%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 animate-orbit-slow" style={{ animationDuration: '90s' }}>
        {orbitNodes.map((node, i) => {
          const angle = (node.angle * Math.PI) / 180;
          const r = 280;
          const x = 280 + Math.cos(angle) * r - 24;
          const y = 280 + Math.sin(angle) * r - 24;
          return (
            <div
              key={i}
              className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-graphite bg-carbon/80 backdrop-blur-sm"
              style={{ left: x, top: y }}
            >
              <span className="font-medium text-citrine" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
                {node.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Orbiting nodes — inner ring (reverse) */}
      <div className="absolute left-1/2 top-[38%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 animate-orbit-reverse" style={{ animationDuration: '60s' }}>
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const angle = (deg * Math.PI) / 180;
          const r = 180;
          const x = 180 + Math.cos(angle) * r - 16;
          const y = 180 + Math.sin(angle) * r - 16;
          return (
            <div
              key={i}
              className="absolute flex h-8 w-8 items-center justify-center rounded-full border border-smoke/40 bg-carbon/60"
              style={{ left: x, top: y }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-bone/60" />
            </div>
          );
        })}
      </div>

      {/* Content stack */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Cube above headline */}
        <div className="mb-12 animate-fade-up">
          <CitrineCube size={140} glow="strong" rotate />
        </div>

        {/* Feature pills */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up delay-100">
          {['PRIVACY-PRESERVING', 'BNB + ETHEREUM', 'ZAMA FHE POWERED'].map((pill) => (
            <span
              key={pill}
              className="flex items-center gap-1.5 rounded-btn border border-chalk/10 bg-graphite/40 px-3 py-1.5 font-medium uppercase tracking-[0.032em] text-citrine"
              style={{ fontSize: '10px' }}
            >
              <span className="inline-block h-1 w-1 rounded-full bg-citrine" />
              {pill}
            </span>
          ))}
        </div>

        {/* Display headline */}
        <h1
          className="max-w-4xl font-normal uppercase text-bone animate-fade-up delay-200"
          style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}
        >
          Play, interact<br />
          and earn —<br />
          <span className="text-citrine">powered by privacy</span>
        </h1>

        {/* Subheading */}
        <p
          className="mt-8 max-w-xl text-stone animate-fade-up delay-300"
          style={{ fontSize: '16px', lineHeight: 1.5 }}
        >
          UNEVENTFUL is a blockchain platform using Zama's fully homomorphic encryption to build
          mini social games on BNB and Ethereum. Stake, vote, and win — your moves stay private until reveal.
        </p>

        {/* CTA row */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-up delay-400">
          <a
            href="#play"
            className="flex items-center gap-2 rounded-btn bg-citrine px-8 py-4 font-medium text-carbon transition-opacity hover:opacity-90"
            style={{ fontSize: '16px' }}
          >
            <span className="inline-block h-2 w-2 bg-carbon" />
            Play MinorityWin
          </a>
          <a
            href="#platform"
            className="flex items-center gap-2 rounded-btn border border-bone/20 px-8 py-4 font-medium uppercase tracking-[0.032em] text-bone transition-colors hover:bg-bone/5"
            style={{ fontSize: '12px' }}
          >
            Explore the platform
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float-y">
        <div className="flex flex-col items-center gap-2">
          <span className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-citrine/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
