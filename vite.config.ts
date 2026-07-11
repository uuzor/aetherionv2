import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cross-Origin-Opener-Policy (COOP) + Cross-Origin-Embedder-Policy (COEP) are
// REQUIRED for the Zama FHE `web()` relayer: it runs a WASM worker that needs
// SharedArrayBuffer / cross-origin isolation. Without these headers the worker
// never starts and every encrypt() fails.
//
// Use COEP=credentialless (NOT require-corp). require-corp blocks every
// cross-origin subresource lacking a Cross-Origin-Resource-Policy header.
// Zama's public key is served from S3 (zama-mpc-testnet-public-*.s3...) which
// sends ACAO:* but NO CORP, so a no-cors fetch to it silently hangs under
// require-corp -> input.encrypt() never returns -> "Worker operation ENCRYPT
// timed out after 30s". credentialless keeps cross-origin isolation (the worker
// still works) but permits no-cors cross-origin resources without CORP.
const crossOriginIsolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

// The Zama testnet relayer only echoes CORS headers on GET (e.g. /keyurl), NOT
// on the encrypt POST (/input-proof). A browser cross-origin POST therefore gets
// no Access-Control-Allow-Origin and is blocked -> encrypt() hangs 30s. Proxy
// the relayer through same-origin so the SDK never makes a cross-origin POST.
// `/relayer/<path>` -> `https://relayer.testnet.zama.org/v2/<path>`.
const relayerProxy = {
  '/relayer': {
    target: 'https://relayer.testnet.zama.org',
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/relayer/, '/v2'),
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Do NOT pre-bundle the Zama FHE SDKs. Vite's esbuild dep optimizer drops the
    // SDK's nested Web Worker (`relayer-sdk.worker.js`, referenced internally via
    // `new URL('...', import.meta.url)`). When optimized away, the worker fails to
    // load, initSDK() never completes, and every encrypt() hangs for 30s
    // ("Worker operation ENCRYPT timed out"). Serving the SDK as raw ESM lets Vite
    // emit the worker asset so the URL resolves.
    exclude: ['lucide-react', '@zama-fhe/sdk', '@zama-fhe/react-sdk'],
  },
  server: {
    headers: crossOriginIsolation,
    proxy: relayerProxy,
  },
  preview: {
    headers: crossOriginIsolation,
    // `preview` has no proxy by default; for a production preview build you must
    // proxy /relayer at the hosting layer (e.g. a serverless function / nginx).
  },
});
