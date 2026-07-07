const logos = [
  'ZAMA', 'BNB CHAIN', 'ETHEREUM', 'FHE', 'OPENZEPPIN', 'CHAINLINK',
  'THE GRAPH', 'ARBITRUM', 'BASE', 'OPTIMISM',
];

export function LogoCloud() {
  return (
    <section className="border-y border-chalk/5 bg-carbon py-16">
      <div className="mx-auto max-w-page px-6">
        <p
          className="mb-10 text-center font-medium uppercase tracking-[0.032em] text-stone"
          style={{ fontSize: '10px' }}
        >
          Built on the most secure privacy &amp; chain infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {logos.map((logo) => (
            <span
              key={logo}
              className="font-medium tracking-[0.027em] text-bone opacity-60 transition-opacity hover:opacity-100"
              style={{ fontSize: '16px' }}
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
