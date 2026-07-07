Operator approvals
How to approve another address to act on your confidential tokens.

Operator approval lets another address (a DEX contract, multisig, or automated service) transfer confidential tokens on your behalf. This is the FHE equivalent of ERC-20's approve / transferFrom pattern.

Steps
1. Approve an operator
Call setOperator on a token instance. By default, the approval is valid for 1 hour:


Copy
const token = sdk.createToken("0xEncryptedERC20");

// Approve with the default 1-hour duration
await token.setOperator("0xOperator");
The SDK sends a single on-chain transaction. The operator can call confidentialTransferFrom until the approval expires.

2. Approve with a custom expiry
Pass a Unix timestamp (in seconds) as the second argument to set a longer or shorter approval window:


Copy
// Approve until a specific timestamp (e.g. 24 hours from now)
const expiry = Math.floor(Date.now() / 1000) + 86400;
await token.setOperator("0xOperator", expiry);
3. Check operator status
Query whether a spender is currently an approved operator:


Copy
// holder is the token owner, spender is the operator to check
const approved = await token.isOperator("0xHolder", "0xSpender");
// returns true if the approval is active and has not expired
4. Use operator transfer
Once approved, the operator can transfer tokens from the owner's confidential balance:


Copy
// As the approved operator
const token = sdk.createToken("0xEncryptedERC20");

await token.confidentialTransferFrom("0xFrom", "0xTo", 500n);
The amount is encrypted before submission, just like a regular confidentialTransfer. On-chain observers see the transaction but not the value.

5. React: use the operator hooks
The React SDK provides hooks that wrap these operations with loading states and error handling:


Copy
"use client";

import {
  useConfidentialSetOperator,
  useConfidentialIsOperator,
  useConfidentialTransferFrom,
} from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

function OperatorPanel({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { address } = useAccount();
  const { mutateAsync: setOperator, isPending: isSettingOperator } =
    useConfidentialSetOperator(tokenAddress);

  const { data: isOperator } = useConfidentialIsOperator({
    address: tokenAddress,
    holder: address,
    spender: "0xOperator",
  });

  const { mutateAsync: transferFrom, isPending: isTransferring } =
    useConfidentialTransferFrom(tokenAddress);

  return (
    <div>
      <p>Operator approved: {isOperator ? "Yes" : "No"}</p>
      <button onClick={() => setOperator({ operator: "0xOperator" })} disabled={isSettingOperator}>
        Set Operator
      </button>
      <button
        onClick={() => transferFrom({ from: "0xOwner", to: "0xRecipient", amount: 500n })}
        disabled={isTransferring}
      >
        Transfer From
      </button>
    </div>
  );
}
6. Finalize-unwrap operator approval
Operator approval also applies to the unshield (unwrap + finalize) flow. If an operator needs to unshield tokens on the owner's behalf, the owner must approve the operator separately for this action. The approval mechanism is the same -- token.setOperator("0xOperator") -- and the operator can then call unshield or unshieldAll on the owner's tokens.

This is a distinct concern from transfer approval: approving an operator for transfers does not automatically allow them to unshield.

Next steps


Check balances
Decrypt and read confidential token balances using the SDK and React hooks.

Confidential balances are stored on-chain as encrypted values. To display a human-readable number, the SDK decrypts them using FHE permits tied to the user's wallet. This guide walks through reading balances, understanding the caching layer, and working with multiple tokens.

Steps
1. Read your own balance
Call balanceOf() on a Token instance. The SDK fetches the encrypted value from the chain, decrypts it, and returns a bigint.


SDK

Copy
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  storage,
  relayers: { [sepolia.id]: web() },
});
const sdk = new ZamaSDK(config);
const token = sdk.createToken("0xEncryptedERC20");

const [address] = await walletClient.getAddresses();
const balance = await token.balanceOf(address);
console.log(`Confidential balance: ${balance}`);
2. Understand the first-time wallet signature
The first balanceOf(address) call for a token prompts the user's wallet for an EIP-712 signature. This creates FHE decrypt permits that are cached in your storage backend. Subsequent reads are silent -- no wallet popup.

In React apps, don't trigger this signature on render. Gate useConfidentialBalance behind useHasPermit and let the user click an explicit "Decrypt" button. See Avoid blind-sign wallet popups for the full pattern.

If the user rejects the signature, the SDK throws a SigningRejectedError. See Handle Errors for recovery patterns.

You can pre-authorize multiple tokens with a single signature using sdk.permits.grantPermit():


SDK

Copy
await sdk.permits.grantPermit(["0xTokenA", "0xTokenB"]);

const tokenA = sdk.createToken("0xTokenA");
const tokenB = sdk.createToken("0xTokenB");
// All subsequent balanceOf() calls are silent
3. Balance caching
Decrypted balances are automatically cached in your storage backend (IndexedDB, async local storage, etc.). This means:

No spinner on page reload -- if a balance was previously decrypted, it is returned instantly from cache instead of re-running the 2-5 second FHE decryption.

Automatic invalidation -- the cache key includes the on-chain encrypted value, so when a transfer, shield, or unshield changes the balance, the old cache entry is naturally bypassed.

Best-effort -- cache reads and writes never throw. If storage is unavailable, the SDK falls back to a fresh decryption silently.

The cache is keyed by token address + owner address + encrypted value.

4. Work with raw encrypted values
Sometimes you need the encrypted value itself, for example to check whether a balance exists before attempting decryption.


SDK

Copy
import { isEncryptedValueZero } from "@zama-fhe/sdk";

const encryptedValue = await token.confidentialBalanceOf(userAddress);

// Check if the encrypted value is zero (account has never shielded)
if (isEncryptedValueZero(encryptedValue)) {
  console.log("No confidential balance yet");
}

// Decrypt an encrypted value you already have
const result = await sdk.decryption.decryptValues([
  { encryptedValue, contractAddress: token.address },
]);
const value = result[encryptedValue] as bigint;

// Decrypt multiple encrypted values at once (must include the contract address per entry)
const decrypted = await sdk.decryption.decryptValues(
  [value1, value2, value3].map((v) => ({ encryptedValue: v, contractAddress: token.address })),
);
5. Distinguish "no balance" from "zero balance"
These are different situations that your UI should handle separately:

NoCiphertextError -- the account has never shielded tokens. There is no encrypted balance to decrypt. Show something like "No confidential balance" in your UI.

Balance of 0n -- the account has shielded before but currently holds zero. Show "Balance: 0".


SDK

Copy
import { NoCiphertextError } from "@zama-fhe/sdk";

try {
  const [address] = await walletClient.getAddresses();
  const balance = await token.balanceOf(address);
  showBalance(balance); // could be 0n
} catch (error) {
  if (error instanceof NoCiphertextError) {
    showEmptyState("Shield tokens to get started");
  }
}
6. Batch decrypt across multiple tokens
When your app manages a portfolio of confidential tokens, use batch operations to minimize wallet prompts and parallelize decryption.


SDK

Copy
import { Token } from "@zama-fhe/sdk";

// One wallet signature covers all tokens
await sdk.permits.grantPermit(addresses);

const tokens = addresses.map((a) => sdk.createToken(a));

// Decrypt all balances in parallel
const { results, errors } = await Token.batchBalancesOf(tokens, userAddress);

// `results` is Map<Address, bigint> for tokens that decrypted successfully,
// `errors` is Map<Address, ZamaError> for tokens that failed — partial failure
// never rejects the whole batch.
for (const [address, balance] of results) {
  console.log(address, balance);
}
7. Read token metadata
Before displaying balances, you typically want the token's name, symbol, and decimals. Use the useMetadata hook:


Copy
import { useMetadata } from "@zama-fhe/react-sdk";

const { data: meta } = useMetadata("0xToken");

// meta.name, meta.symbol, meta.decimals
See useMetadata reference for full options.

8. Use the balance hooks in React
The React SDK provides hooks that handle polling, caching, and React Query integration out of the box.


Single token

Multiple tokens

Copy
import { useConfidentialBalance } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

const { address } = useAccount();
const {
  data: balance,
  isLoading,
  error,
} = useConfidentialBalance(
  {
    address: "0xToken",
    account: address,
  },
  { refetchInterval: 5_000 },
);
useConfidentialBalance calls token.balanceOf(owner) which reads the on-chain encrypted value and decrypts via the SDK. Cached clear values are served instantly — the relayer is only hit when the encrypted value changes. Pass refetchInterval to poll for updates. Clear values are persisted in storage, so page reloads show the balance instantly.

9. Force a manual refresh
Mutations automatically invalidate balance caches, but if you need manual control (for example, after an external contract interaction), use zamaQueryKeys:


React

Copy
import { useQueryClient } from "@tanstack/react-query";
import { zamaQueryKeys } from "@zama-fhe/sdk/query";

const queryClient = useQueryClient();

// Invalidate all balance queries
queryClient.invalidateQueries({
  queryKey: zamaQueryKeys.confidentialBalance.all,
});

// Invalidate one token
queryClient.invalidateQueries({
  queryKey: zamaQueryKeys.confidentialBalance.token("0xToken"),
});
Next steps



Encrypt & decrypt
How to encrypt values and decrypt FHE encrypted values for custom confidential smart contracts that are not wrapped ERC-20 tokens.

The high-level token hooks (useShield, useConfidentialTransfer, useConfidentialBalance) handle encryption and decryption automatically for wrapped confidential ERC-20 tokens. This guide is for a different scenario: your smart contract uses FHE types directly (e.g. a confidential voting contract, a sealed-bid auction, or any non-token contract that stores euint values). In that case, you need useEncrypt and useDecryptValues to interact with your contract's encrypted parameters and return values.

Before starting, make sure your project is set up following the Configuration guide.

Example
Here is a complete flow that encrypts a value, sends it to a custom FHE contract, reads back the encrypted value, and decrypts it:

ConfidentialRoundTrip.tsx

Copy
import { useEncrypt, useDecryptValues, useZamaSDK } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";
import { useState, type FormEvent } from "react";

function ConfidentialRoundTrip() {
  const sdk = useZamaSDK();
  const encrypt = useEncrypt();
  const { address: userAddress } = useAccount();
  const [inputs, setInputs] = useState<
    { encryptedValue: string; contractAddress: `0x${string}` }[]
  >([]);

  // Disabled by default — opt in with `enabled`. The hook still waits for
  // non-empty inputs and a connected wallet before it decrypts.
  const { data: decrypted } = useDecryptValues(inputs, { enabled: true });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const contractAddress = "0xYourContract" as `0x${string}`;

    // 1. Encrypt
    const encrypted = await encrypt.mutateAsync({
      values: [{ value: 42n, type: "euint64" }],
      contractAddress,
      userAddress: userAddress!,
    });

    // 2. Send to contract
    await sdk.signer!.writeContract({
      address: contractAddress,
      abi: yourContractABI,
      functionName: "store",
      args: [encrypted.encryptedValues[0]!, encrypted.inputProof],
    });

    // 3. Read the encrypted value back — setting inputs triggers decryption
    const encryptedValue = (await sdk.provider.readContract({
      address: contractAddress,
      abi: yourContractABI,
      functionName: "getHandle",
      args: [userAddress],
    })) as string;

    setInputs([{ encryptedValue, contractAddress }]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={encrypt.isPending}>
        Encrypt → Store → Decrypt
      </button>
      {decrypted && inputs[0] && (
        <output>Decrypted: {decrypted[inputs[0].encryptedValue]?.toString()}</output>
      )}
    </form>
  );
}
Required: Cross-Origin headers

useEncrypt loads FHE WASM in a Web Worker, which requires SharedArrayBuffer. You must set these HTTP headers:


Copy
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp

Next.js

Vite

Copy
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};
See Configuration for full setup instructions.

SSR: "window is not defined"

FHE operations use Web Workers and browser APIs. In Next.js or other SSR frameworks, ensure all components using encrypt/decrypt hooks are client components:


Copy
"use client"; // Required at the top of the file

import { useEncrypt, useDecryptValues } from "@zama-fhe/react-sdk";
Steps
1. Encrypt values with useEncrypt
useEncrypt encrypts plaintext values into FHE ciphertext that can be passed to any smart contract function that accepts encrypted parameters (e.g. einput + bytes proof).

EncryptExample.tsx

Copy
import { useEncrypt } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

function EncryptExample() {
  const encrypt = useEncrypt();
  const { address: userAddress } = useAccount();

  const handleEncrypt = async () => {
    const result = await encrypt.mutateAsync({
      values: [{ value: 1000n, type: "euint64" }],
      contractAddress: "0xYourConfidentialContract",
      userAddress: userAddress!,
    });

    // result.encryptedValues — array of `0x`-prefixed hex encrypted values, one per value (contract-ready)
    // result.inputProof — `0x`-prefixed hex proof, required alongside the encrypted values in contract calls
    // Use encryptedValues and inputProof in your contract call (see next section)
  };

  return (
    <button onClick={handleEncrypt} disabled={encrypt.isPending}>
      {encrypt.isPending ? "Encrypting..." : "Encrypt"}
    </button>
  );
}
Encrypting multiple values
Pass multiple values in a single call. Each value needs its FHE type.


Copy
const result = await encrypt.mutateAsync({
  values: [
    { value: 500n, type: "euint64" }, // amount
    { value: true, type: "ebool" }, // flag
    { value: 42n, type: "euint32" }, // parameter
  ],
  contractAddress: "0xYourContract",
  userAddress,
});

// result.encryptedValues[0] — encrypted 500n
// result.encryptedValues[1] — encrypted true
// result.encryptedValues[2] — encrypted 42n
// result.inputProof — shared proof for all encrypted values
Encryption returns empty encrypted values? Make sure contractAddress and userAddress are valid addresses, not undefined. If using wagmi, wait for the account to be connected:


Copy
const { address } = useAccount();

// Don't encrypt until connected
if (!address) return <p role="status">Connect wallet first</p>;
2. Use encrypted values in contract calls
After encryption, pass the encrypted values and proof to your custom FHE contract. Both are 0x-prefixed hex, so they go straight into a writeContract call — no conversion needed:

ConfidentialAction.tsx

Copy
import { useEncrypt, useZamaSDK } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

function ConfidentialAction() {
  const sdk = useZamaSDK();
  const encrypt = useEncrypt();
  const { address } = useAccount();

  const handleAction = async () => {
    // 1. Encrypt the value
    const { encryptedValues, inputProof } = await encrypt.mutateAsync({
      values: [{ value: 1000n, type: "euint64" }],
      contractAddress: "0xYourContract",
      userAddress: address!,
    });

    // 2. Call your contract with the encrypted data
    await sdk.signer!.writeContract({
      address: "0xYourContract",
      abi: yourContractABI,
      functionName: "yourFunction",
      args: [encryptedValues[0]!, inputProof],
    });
  };

  return <button onClick={handleAction}>Submit</button>;
}
3. Decryption of the encrypted data
Decrypting on-chain data requires the user to sign an EIP-712 message that grants your app a reusable permit for the relevant contracts. Hooks like useDecryptValues and useConfidentialBalance trigger this signature automatically the first time they run. If your app calls these hooks on render without gating, users see an unsolicited MetaMask popup before they have taken any action — a confusing experience that often leads to rejection.

A good decryption UX follows three steps:

Check permits — use useHasPermit to see whether the user has already signed.

Show a locked state — display a clear "Decrypt" button so the user understands what they are authorizing.

Decrypt on demand — only mount balance or decrypt components after permits exist.

Never call useConfidentialBalance or useDecryptValues without gating on useHasPermit:


Copy
// BAD — triggers wallet popup as soon as the component mounts
function BadExample({ tokenAddress }: { tokenAddress: Address }) {
  const balance = useConfidentialBalance({ address: tokenAddress });
  return <p>{balance.data?.toString()}</p>;
}
This causes an unexpected MetaMask popup, user rejection, potential Blockaid flags, and loss of trust.

Gating useConfidentialBalance
Split the gate and the balance display into separate components. The gate checks credentials and shows a decrypt button; the balance component only mounts once credentials exist, so it never triggers a wallet popup.


DecryptGate.tsx

ConfidentialBalance.tsx

App.tsx

Copy
import { useGrantPermit, useHasPermit } from "@zama-fhe/react-sdk";
import type { Address } from "viem";

function DecryptGate({
  contractAddresses,
  children,
}: {
  contractAddresses: Address[];
  children: React.ReactNode;
}) {
  const { data: hasPermit } = useHasPermit({ contractAddresses });
  const { mutate: grantPermit, isPending } = useGrantPermit();

  if (hasPermit) return <>{children}</>;

  return (
    <button onClick={() => grantPermit(contractAddresses)} disabled={isPending}>
      {isPending ? "Signing..." : "Decrypt Balances"}
    </button>
  );
}
DecryptGate only renders its children once useHasPermit returns true. This means ConfidentialBalance never mounts without permits — no enabled guard needed, no wallet popup on render. Returning users skip the prompt entirely because permits persist in IndexedDB (default TTL: 30 days).

The same pattern works with useDecryptValues and any other decrypt hook — anything nested inside DecryptGate can decrypt freely without triggering a wallet prompt.

When contract addresses come from the chain (e.g. useListPairs), DecryptGate automatically detects new addresses and prompts the user once to extend their authorization:


Copy
import { useListPairs } from "@zama-fhe/react-sdk";

function App() {
  const { data: pairs } = useListPairs({ metadata: true });
  const addresses = pairs?.items.map((p) => p.confidentialTokenAddress) ?? [];

  return (
    <DecryptGate contractAddresses={addresses}>
      {pairs?.items.map((p) => (
        <ConfidentialBalance
          key={p.confidentialTokenAddress}
          tokenAddress={p.confidentialTokenAddress}
          decimals={p.confidential.decimals}
          symbol={p.confidential.symbol}
        />
      ))}
    </DecryptGate>
  );
}
Decrypting encrypted values from multiple contracts
useDecryptValues automatically groups inputs by contract address and issues one decryption request per contract:


Copy
const { data } = useDecryptValues([
  { encryptedValue: "0xvalue1...", contractAddress: "0xTokenA" },
  { encryptedValue: "0xvalue2...", contractAddress: "0xTokenA" },
  { encryptedValue: "0xvalue3...", contractAddress: "0xTokenB" },
]);

// data: { "0xvalue1...": 500n, "0xvalue2...": 200n, "0xvalue3...": 1000n }
Persistent caching
Decrypted values are stored through the SDK's internal CachingService, scoped by signer and contract address. Cached values survive page reloads — useDecryptValues returns them instantly without hitting the relayer.

The cache is cleared on permits.revokePermits(), permits.clear(), or wallet lifecycle events (disconnect, account/chain change).

Decryption fails with an invalid or expired transport key pair? The transport key pair has a TTL (default: 30 days). If the key pair was generated more than transportKeyPairTTL seconds ago, the relayer rejects it. Call useGrantPermit again to generate a fresh transport key pair and permits.

4. Decrypt with useDecryptPublicValues (advanced)
For values marked as publicly decryptable on-chain, no transport key pair or signature is needed:

PublicDecryptExample.tsx

Copy
import { useDecryptPublicValues } from "@zama-fhe/react-sdk";

function PublicDecryptExample() {
  const decryptPublicValues = useDecryptPublicValues();

  const handleDecrypt = async () => {
    const result = await decryptPublicValues.mutateAsync(["0xEncryptedValue..."]);
    // result.clearValues: { "0xEncryptedValue...": 1000n }
  };

  return <button onClick={handleDecrypt}>Public Decrypt</button>;
}


Delegated decryption
Grant another address the right to decrypt confidential balances, then read those balances as a delegate.

Delegation lets one address grant another address the right to decrypt its confidential balances. The delegate never receives the delegator's private keys — they use their own transport key pair and a delegated EIP-712 flow to prove they have permission.

Common use cases:

Portfolio dashboards — a read-only service decrypts balances across wallets without holding keys.

Auditors — a third party verifies holdings without the token owner being online.

This guide uses sdk.delegations and token.decryptBalanceAs. Before starting, make sure your project is set up following the Configuration guide.

Example
A complete delegation flow — grant, wait for propagation, then decrypt as delegate:


SDK

Copy
import { createConfig, ZamaSDK } from "@zama-fhe/sdk";
import { sepolia } from "@zama-fhe/sdk/chains";

const sdk = new ZamaSDK(config); // config from createConfig()
const token = sdk.createToken("0xConfidentialToken");

// 1. Delegator grants decryption rights
const { txHash } = await sdk.delegations.delegateDecryption({
  contractAddress: token.address,
  delegateAddress: "0xDelegate",
});

// 2. Wait 1–2 minutes for gateway propagation

// 3. Delegate reads the delegator's balance
const balance = await token.decryptBalanceAs({
  delegatorAddress: "0xDelegator",
});
Steps
1. Grant delegation
The token owner calls sdk.delegations.delegateDecryption to allow a delegate to decrypt their balance for a specific contract.


SDK

Copy
// Permanent delegation (no expiration)
await sdk.delegations.delegateDecryption({
  contractAddress: token.address,
  delegateAddress: "0xDelegate",
});

// Delegation with an expiration date
await sdk.delegations.delegateDecryption({
  contractAddress: token.address,
  delegateAddress: "0xDelegate",
  expirationDate: new Date("2027-12-31T00:00:00Z"),
});
Both calls return { txHash, receipt }.

The expiration date must be at least 1 hour in the future. Passing a closer date throws DelegationExpirationTooSoonError before the transaction is sent.

Each call grants delegation for a single (contractAddress, delegateAddress) pair and submits one on-chain transaction.

2. Wait for gateway propagation
After the delegation transaction is mined, wait 1–2 minutes before calling decryptBalanceAs. The delegation is recorded on L1 immediately, but the gateway (on Arbitrum) must sync the ACL state via cross-chain event propagation. Attempting delegated decryption before propagation completes throws DelegationNotPropagatedError.

3. Decrypt as delegate
The delegate calls token.decryptBalanceAs to read the delegator's balance. The delegate signs with their own wallet, and the relayer verifies the on-chain delegation before decrypting.


SDK

Copy
const balance = await token.decryptBalanceAs({
  delegatorAddress: "0xDelegator",
});
When the balance holder differs from the delegator, pass accountAddress explicitly:


Copy
const balance = await token.decryptBalanceAs({
  delegatorAddress: "0xDelegator",
  accountAddress: "0xBalanceHolder",
});
Clear values are cached in storage, keyed by (accountAddress, token, encryptedValue). Every on-chain balance change produces a new encrypted value, so stale cache entries are never served.

4. Batch decryption across tokens (optional)
Decrypt balances across multiple tokens in a single call:


SDK

Copy
import { Token } from "@zama-fhe/sdk";

const tokens = addresses.map((a) => sdk.createToken(a));

const balances = await Token.batchDecryptBalancesAs(tokens, {
  delegatorAddress: "0xDelegator",
});

// balances is a Map<Address, bigint>
for (const [address, balance] of balances) {
  console.log(`${address}: ${balance}`);
}
Handle errors for individual tokens with onError:


Copy
const balances = await Token.batchDecryptBalancesAs(tokens, {
  delegatorAddress: "0xDelegator",
  maxConcurrency: 3,
  onError: (err, addr) => {
    console.error(addr, err);
    return 0n;
  },
});
5. Revoke delegation (optional)

Copy
await sdk.delegations.revokeDelegation({
  contractAddress: token.address,
  delegateAddress: "0xDelegate",
});
6. Handle errors (optional)
Delegation operations can throw several error types. The most common:


SDK

Copy
import {
  DelegationNotPropagatedError,
  DelegationExpirationTooSoonError,
  SigningRejectedError,
  DecryptionFailedError,
  TransactionRevertedError,
} from "@zama-fhe/sdk";

try {
  await sdk.delegations.delegateDecryption({
    contractAddress: token.address,
    delegateAddress: "0xDelegate",
  });
} catch (error) {
  if (error instanceof DelegationExpirationTooSoonError) {
    // expiration date is less than 1 hour in the future
  } else if (error instanceof TransactionRevertedError) {
    // on-chain transaction failed
  }
}

try {
  const balance = await token.decryptBalanceAs({
    delegatorAddress: "0xDelegator",
  });
} catch (error) {
  if (error instanceof SigningRejectedError) {
    // user cancelled the wallet prompt — do not retry automatically
  } else if (error instanceof DelegationNotPropagatedError) {
    // delegation hasn't synced to the gateway yet — retry after 1–2 minutes
  } else if (error instanceof DecryptionFailedError) {
    // delegated decryption failed
  }
}
See Handle errors for full error-handling patterns and Error types for the complete list.