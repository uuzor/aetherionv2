import { Constellation } from './CitrineCube';

export function SplitFeature() {
  return (
    <section id="platform" className="bg-carbon py-32">
      <div className="mx-auto max-w-page px-6">
        {/* Section label */}
        <div className="mb-16 flex items-center gap-3">
          <span className="inline-block h-2 w-2 bg-citrine" />
          <span className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
            THE PLATFORM
          </span>
        </div>

        <div className="grid items-center gap-16 lg:grid-cols-[40%_60%]">
          {/* Text column */}
          <div>
            <h2
              className="font-medium text-bone"
              style={{ fontSize: '24px', lineHeight: 1.2 }}
            >
              Privacy isn't a feature.<br />It's the game.
            </h2>
            <div className="mt-6 space-y-4">
              <p className="max-w-md text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
                UNEVENTFUL runs on Zama's fully homomorphic encryption. That means every stake,
                every vote, and every move is encrypted on-chain. Nothing leaks until the round reveals.
              </p>
              <p className="max-w-md text-stone" style={{ fontSize: '16px', lineHeight: 1.5 }}>
                Developers get a toolkit to deploy mini social games on BNB and Ethereum where
                players can interact in rooms, coordinate, and compete — without exposing strategy
                to front-runners, MEV bots, or chain snoops.
              </p>
            </div>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {['FHE ENCRYPTED STATE', 'MEV-RESISTANT', 'MULTI-CHAIN', 'REAL-TIME ROOMS'].map((pill) => (
                <span
                  key={pill}
                  className="flex items-center gap-1.5 rounded-btn border border-chalk/10 bg-graphite/30 px-3 py-1.5 font-medium uppercase tracking-[0.032em] text-citrine"
                  style={{ fontSize: '10px' }}
                >
                  <span className="inline-block h-1 w-1 rounded-full bg-citrine" />
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Visual column */}
          <div className="flex justify-center">
            <Constellation />
          </div>
        </div>
      </div>
    </section>
  );
}
