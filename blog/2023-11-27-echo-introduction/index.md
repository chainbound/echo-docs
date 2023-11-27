---
slug: introducing-echo
title: "Introducing Echo: A Comprehensive Builder API for On-Chain Trading"
authors: [nicolas]
tags: [ethereum, pbs, mev]
---

> In the realm of on-chain trading, where speed and efficiency are critical, Echo emerges as a pivotal tool. Developed as an aggregated builder API, Echo is tailored for MEV searchers, quant shops, bot operators and blockchain hedge funds alike. It was born out of specific requests from the customers of Fiber, our low-latency Ethereum mempool streaming service.

## How does it work?

Echo is a drop-in replacement to the standard Flashbots RPC interface for sending MEV bundles and private transactions, while also bringing additional, advanced features to the table.

The extra features for sending a bundle include:

- `mevBuilders`: Choose exactly which block builders to target with your requests. This feature offers granular control over the trust assumptions that underpin the relationship between Searchers and Builders in the current PBS ecosystem. On top of that, we support a large list of builders with more than 96% coverage of PBS blocks, and we regularly maintain this set which you can always consult [on our website](https://echo.chainbound.io/docs/usage/integrations). We monitor the space for new builders and onboard them quickly, given our flexible API interface.
- `usePublicMempool`: Specify if the transactions should also be forwarded to the public mempool. Under the hood, this functionality uses the Fiber Network to broadcast transactions to all of our nodes with the lowest possible latency. This is useful for operators that need to handle a lot of transactions that don’t generate MEV, such as ERC-20 approvals or simple transfers between EOAs. Additionally, more advanced searchers could use tools like the [PBS Relay API](https://github.com/chainbound/mevboost-relay-api) to figure out if a slot will not be built by a MEV-boost enabled proposer and decide to directly bid in the public mempool instead.
- `awaitReceipt`: Opt-in to receive an inclusion receipt in your HTTP responses. Under the hood, this is powered by Fiber’s `new_beacon_blocks` stream for the lowest latency possible. Receipts are extremely useful to understand if and when your trades are effectively included in a new block.
- `retryUntil`: MEV bundles only target a single block by default. By setting the retryUntil flag to a block number in the future, Echo will automatically re-send the bundle on each new block until it is either included on-chain or the target block is surpassed.

If you are curious to learn more about each individual feature, check out [our documentation](https://echo.chainbound.io/docs/usage/api-interface#eth_sendbundle)!

## Real-world usage examples

We prepared example scripts that you can use to get started. Let’s explore some real examples of how you can use Echo as a MEV player today!

- [Example scripts repository](https://github.com/chainbound/echo-usage-examples/) (Typescript and Rust)

### 1. Arbitrage trader

If you are a searcher focusing on short-tail arbitrage on DEXs, you are likely performing backruns on users trades and will need to send bundles to preserve the correct ordering of the target and your transaction. In this case, it would be useful to set the `retryUntil` flag to a couple blocks in the future, just in case the opportunity is not mined in the next block (for instance, if the next block turns out not to be mev-boost enabled).

Additionally, with `awaitReceipt` you will immediately know when your backruns landed and can manage token inventory to your EOA without having to perform any additional requests!

Here’s how the request looks like (in typescript):

```tsx
const bundle = {
  // insert raw transactions inside the bundle
  txs: [toHexString(tx.serialize()), backrunRawSigned],
  blockNumber: nextBlockNumber,
  usePublicMempool: false,
  awaitReceipt: true,
  awaitReceiptTimeoutMs: 60_000,
  mevBuilders: ["titan", "rsync", "beaverbuild"],
};

const rpcRequest = JSON.stringify({
  id: 1,
  jsonrpc: "2.0",
  method: "eth_sendBundle",
  params: [bundle],
});

echoClient.send(rpcRequest);
```

You can find the [full typescript example here](https://github.com/chainbound/echo-usage-examples/blob/main/typescript/uniswap_arb.ts), and a [Rust version here](https://github.com/chainbound/echo-usage-examples/blob/main/rust/uniswap_arb.rs) as well.

### 2. Bot operator

If you are building a bot that needs to manage different users’ wallets, chances are that you will have to send a lot of transactions just to setup trading in the form of ERC20 approvals. This is where you could use Echo’s `usePublicMempool` functionality to lower the inclusion time of the transactions that don’t include any MEV.

Over time, if you obtain enough orderflow, you might want to limit the target block builders to a handful of trusted ones that could potentially offer you services in exchange for an exclusivity deal with them. With Echo, all you have to do is add the `mevBuilders` flag to the array of the selected builders to only forward the orderflow to them.

Here’s how the request looks like (in typescript):

```tsx
// We will send the approval transaction to the public mempool as a
// separate request, as it doesn't contain any MEV.
const approvalTxPayload = {
  tx: erc20ApprovalRawSigned,
  usePublicMempool: true,
  awaitReceipt: true,
  awaitReceiptTimeoutMs: 20_000,
};

const rpcRequest = JSON.stringify({
  id: 1,
  jsonrpc: "2.0",
  method: "eth_sendPrivateRawTransaction",
  params: [approvalTxPayload],
});

console.log("Sending transaction to Echo:", rpcRequest);
echoClient.send(rpcRequest);

// create a fictional erc20 user swap tx (sending 42 wei to ourselves)
// for demo purposes
const erc20UserSwap = await walletClient.prepareTransactionRequest({
  to: account.address,
  value: BigInt(69),
});
const erc20UserSwapRawSigned = await walletClient.signTransaction(
  erc20UserSwap
);

// Send this swap as a private transaction, skipping the public mempool.
const privateTxPayload = {
  txs: [erc20UserSwapRawSigned],
  usePublicMempool: false,
  awaitReceipt: true,
  awaitReceiptTimeoutMs: 60_000,
  mevBuilders: ["titan", "rsync", "beaverbuild"],
};

const rpcRequest2 = JSON.stringify({
  id: 2,
  jsonrpc: "2.0",
  method: "eth_sendPrivateRawTransaction",
  params: [privateTxPayload],
});

console.log("Sending private transaction to Echo:", rpcRequest2);
echoClient.send(rpcRequest2);
```

You can find the [full typescript example here](https://github.com/chainbound/echo-usage-examples/blob/main/typescript/telegram_bot.ts), and a [Rust version here](https://github.com/chainbound/echo-usage-examples/blob/main/rust/telegram_bot.rs) as well.

### 3. Long-tail MEV searcher

If you are targeting opportunities that are rare and highly profitable like exotic liquidations, generalised mempool frontrunning, NFT flash loans or similar, it’s crucial that you target an amount of builders that guarantees high inclusion rate. A possible optimisation could be to use a dynamic list of block builders depending on the size of the MEV opportunity. In this case, `retryUntil` could also be beneficial in case the next block happens to be reorged.

## How to get started with Echo

Echo is free and it’s very simple to get started. If you are already familiar with sending MEV bundles, you can just take a look at our [integration docs](https://echo.chainbound.io/docs/usage/api-interface). If you’ve never sent a bundle or transaction to a block builder before, that’s also fine! We support users through onboarding on [Discord](https://discord.gg/76GtgBGhQE), where we will provide you with a free API key and are available for any support question.

## What are the next steps?

Echo is always evolving. We have a lot of ideas for our roadmap, but we are focusing on 2 things:

1. Making Echo the lowest latency inclusion service on Ethereum: the major goal for the next few weeks will be to distribute Echo globally with different points of presence to guarantee lower latency to builders located in different countries.
2. Building more features based on our users feedback: EVM Simulations, MEV kickback, a Metamask-compatible RPC endpoint are just some of the items we’re exploring. If you have specific requests, we encourage you to join our [Discord](https://discord.gg/76GtgBGhQE) and chat with us!
