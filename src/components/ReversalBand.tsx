import { CitrineCube } from './CitrineCube';

export function ReversalBand() {
  return (
    <section id="privacy" className="relative overflow-hidden bg-cream py-32">
      {/* Large cubes at left edge */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3">
        <div className="flex flex-col gap-8 opacity-90">
          <div className="ml-8 animate-float-y">
            <CitrineCube size={100} glow="none" />
          </div>
          <div className="ml-0 animate-float-y" style={{ animationDelay: '1s' }}>
            <CitrineCube size={140} glow="none" />
          </div>
          <div className="ml-12 animate-float-y" style={{ animationDelay: '2s' }}>
            <CitrineCube size={80} glow="none" />
          </div>
        </div>
      </div>

      {/* Large cubes at right edge */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3">
        <div className="flex flex-col items-end gap-8 opacity-90">
          <div className="mr-0 animate-float-y" style={{ animationDelay: '0.5s' }}>
            <CitrineCube size={120} glow="none" />
          </div>
          <div className="mr-8 animate-float-y" style={{ animationDelay: '1.5s' }}>
            <CitrineCube size={90} glow="none" />
          </div>
          <div className="mr-2 animate-float-y" style={{ animationDelay: '2.5s' }}>
            <CitrineCube size={110} glow="none" />
          </div>
        </div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="inline-block h-2 w-2 bg-citrine" />
          <span className="font-medium uppercase tracking-[0.032em] text-carbon" style={{ fontSize: '10px' }}>
            POWERED BY ZAMA
          </span>
        </div>

        <h2
          className="font-normal uppercase text-carbon"
          style={{ fontSize: 'clamp(36px, 6vw, 80px)', lineHeight: 0.9, letterSpacing: '-0.01em' }}
        >
          Your strategy<br />stays encrypted.
        </h2>

        <p className="mx-auto mt-8 max-w-md text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
          Every action on UNEVENTFUL is computed on encrypted data. No one — not the chain,
          not the operator, not other players — can see your move until the round closes.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#docs"
            className="flex items-center gap-2 rounded-btn bg-carbon px-8 py-4 font-medium text-bone transition-opacity hover:opacity-90"
            style={{ fontSize: '16px' }}
          >
            <span className="inline-block h-2 w-2 bg-citrine" />
            Read the protocol
          </a>
          <a
            href="#play"
            className="flex items-center gap-2 rounded-btn border border-carbon px-8 py-4 font-medium uppercase tracking-[0.032em] text-carbon transition-colors hover:bg-carbon/5"
            style={{ fontSize: '12px' }}
          >
            Try a game
          </a>
        </div>
      </div>
    </section>
  );
}
