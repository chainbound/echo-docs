---
sidebar_position: 1
title: API Interface
---

Echo supports the same API interface as the [Flashbots RPC](https://docs.flashbots.net/flashbots-auction/searchers/advanced/rpc-endpoint), with additional features which are defined below.

The Echo API is available in both HTTP and Websocket flavors:

- The HTTP API entrypoint is `https://v1.echo-rpc.io/`.
- The Websocket API entrypoint is `wss://v1.echo-rpc.io/ws`.

## Authentication

---

Echo uses the same authentication mechanism as [Fiber](https://fiber.chainbound.io). To use the API, you must specify a valid API key in the `x-api-key` header of your request. You can obtain a free API key by reaching out to us at [admin@chainbound.io](mailto:admin@chainbound.io) or by joining our [Discord](https://discord.gg/J4KNdeCYGX) and opening a ticket.

You can test the authentication from your terminal as follows:

```shell
# HTTP
curl https://v1.echo-rpc.io -X POST -H "x-api-key: <YOUR_API_KEY>" -H "Content-Type: application/json" -d '{"id":1,"jsonrpc":"2.0","method":"echo_status","params":[]}'
```

```shell
# Websocket
wscat -c wss://v1.echo-rpc.io/ws -H "x-api-key: <YOUR_API_KEY>" -x '{"id":1,"jsonrpc":"2.0","method":"echo_status","params":[]}
```

## Flashbots Authentication

---

Additionally to an API key, you may also specify a Flashbots signature token in the `x-flashbots-signature` header of your HTTP requests. Echo will automatically forward the signature to the builders that support it, so that you can focus on your strategies and not worry about the details of each builder's API. For more details on the Flashbots signature, please refer to the [Flashbots documentation](https://docs.flashbots.net/flashbots-auction/searchers/advanced/rpc-endpoint#authentication).

:::info
If you are using Echo via Websocket, you have to specify this field in the message body instead.
This is done by encapsulating your existing request (the entire JSON-RPC object) in a new JSON object,
with the `x-flashbots-signature` field as a sibling of the `payload` field. Here is an example:

```json
{
  "x-flashbots-signature": "0x...:0x...",
  "payload": {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "eth_sendBundle",
    "params": [
      {
        "txs": ["0x..."],
        "blockNumber": "0x1234"
      }
    ]
  }
}
```

:::

## Available Methods

---

- [eth_sendBundle](#eth_sendbundle)
- [eth_cancelBundle](#eth_cancelbundle)
- [eth_sendPrivateRawTransaction](#eth_sendprivaterawtransaction)
- [echo_status](#echo_status)
- [echo_getBundleStats](/docs/usage/analytics#echo_getbundlestats)
- [echo_getInclusionStats](/docs/usage/analytics#echo_getinclusionstats)

## `eth_sendBundle`

---

Users can send bundles via the `eth_sendBundle` method with this interface:

```js
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendBundle",
  "params": [
    {
      txs,                   // Array[String], A list of signed transactions to execute in an atomic bundle
      blockNumber,           // String, a hex encoded block number for which this bundle is valid on
      minTimestamp,          // (Optional) Number, the minimum timestamp (in seconds) for which this bundle is valid
      maxTimestamp,          // (Optional) Number, the maximum timestamp (in seconds) for which this bundle is valid
      revertingTxHashes,     // (Optional) Array[String], A list of tx hashes that are allowed to revert
      replacementUuid,       // (Optional) String, UUIDv4 that can be used to cancel/replace this bundle
      refundPercent,         // (Optional) Number, the percentage (from 0 to 100) of the  ETH reward of the last transaction,
                             //   or the transaction specified by refundIndex, that should be refunded back to the ‘refundRecipient’
      refundIndex,           // (Optional) Number, the index of the transaction of which the ETH reward should be refunded.
                             //   Default, last transaction in the bundle
      refundRecipient,       // (Optional) Address, the address that will receive the ETH refund.
                             //   Default, sender of the first transaction in the bundle
      mevBuilders,           // (Optional) Array[String], A list of mev builders to send this bundle to.
                             //   If not specified, the bundle will be sent to all available builders
      usePublicMempool,      // (Optional) Boolean, If true, the bundle will also be propagated to the public mempool
                             //   through Fiber's internal network. Defaults to false.
                             //   WARNING: Using this flag will void the privacy guarantees of the bundle, making it
                             //   frontrunnable by MEV searchers.
      awaitBuilderResponses, // (Optional) Boolean, If true, the HTTP request will hang until all builders have
                             //   responded, and the result will contain a `builderResponses` field. Defaults to false.
      awaitReceipt,          // (Optional) Boolean, If true, the HTTP request will hang until the bundle is either
                             //   included in a block, or the specified timeout is reached. Defaults to false.
      awaitReceiptTimeoutMs, // (Optional) Number, The timeout (in milliseconds) for the awaitReceipt flag.
                             //   Defaults to 30000 (30 seconds) if not specified and awaitReceipt is true.
      retryUntil,            // (Optional) String, a hex encoded block number until which the bundle should be retried
                             //   with the same parameters if it is not included in the target block.
    }
  ]
}
```

:::warning
The `usePublicMempool` flag will void the privacy guarantees of the bundle, making it frontrunnable by anyone else, including other MEV searchers. Use it only to send bundles that are not vulnerable to frontrunning.
:::

:::info
The `awaitBuilderResponses` flag can be very useful during testing & debugging, as it allows you to see the response from each builder. If for some reason some builders are returning an error, you can easily identify them and fix the issue. It's recommended to set this flag
to false in production, as it will slow down the API response time significantly.
:::

#### Successful response

Here is the successful response format that you can expect from the API:

```js
{
  "jsonrpc": "2.0",
  "id": "123",
  "result": {
    bundleHash,          // String, a unique 256-bit bundle identifier, based its payload.
    receiptNotification, // (Optional) object containing the on-chain receipt of the bundle.
                         //   This field will only be present if you specified the `awaitReceipt` flag
                         //   in the request.
    builderResponses,    // (Optional) object containing the various builder responses as a key-value map,
                         //   with the key being the builder name, and the value being the response from that builder.
                         //   This field will only be present if you specified the `awaitBuilderResponses` flag
                         //   in the request.
  }
}
```

### Bundle Receipt Notification

If you set the `awaitReceipt` flag to **true** in the request params,
the response will also include the `receiptNotification` field, which will be one of the following:

```js
{
  // ...,
  "receiptNotification": {
    status: "included" | "timedOut", // "included" if the bundle was included in a block, "timedOut" if the
                                     // "awaitReceiptTimeoutMs" (default: 30s) was reached without inclusion.
    data: {
      blockNumber, // Number, the block number in which the bundle was included. Only present if status == "included"
      elapsedMs    // Number, the time (in milliseconds) since the bundle was submitted. Always present.
    }
  }
}
```

## `eth_cancelBundle`

---

Echo allows users to cancel pending bundles by submitting a cancellation request via the `eth_cancelBundle` method:

```js
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_cancelBundle",
  "params": [
    {
      replacementUuid, // UUIDv4 to uniquely identify submission
      mevBuilders      // (Optional) Array[String], A list of mev builders to send the cancel request to.
                       //   If not specified, the cancelBundle request will be sent only to the builders
                       //   that were originally specified when the bundle was submitted with `eth_sendBundle`
    }
  ]
}
```

:::note
The `replacementUuid` field must have been set when the bundle was originally submitted with `eth_sendBundle`.
:::

:::warning
You cannot specify a `replacementUuid` together with the `usePublicMempool` flag,
as transactions sent to the public mempool can always be included by anyone.
:::

#### Successful response

```js
{
  "jsonrpc": "2.0",
  "id": "123",
  "result": true  // Boolean, true if the cancellation request was successfully sent to block builders
}
```

## `eth_sendPrivateRawTransaction`

---

Echo allows users to send private transactions via the `eth_sendPrivateRawTransaction` method:

```js
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendPrivateRawTransaction",
  "params": [
    {
      tx,                    // String, the signed private transaction to execute
      mevBuilders,           // (Optional) Array[String], A list of mev builders to send this transaction to.
                             //   If not specified, the transaction will be sent to all available builders that
                             //   support receiving private transactions.
                             //   If "mevBuilders":["none"] and "usePublicMempool":true transactions will ONLY be sent via mempool thorugh Fiber's internal network. 
      awaitReceipt,          // (Optional) Boolean, If true, the HTTP request will hang until the transaction is either
                             //   included in a block, or the specified timeout is reached. Defaults to false.
      awaitReceiptTimeoutMs, // (Optional) Number, The timeout (in milliseconds) for the awaitReceipt flag.
                             //   Defaults to 30000 (30 seconds) if not specified and awaitReceipt is true.
      usePublicMempool,      // (Optional) Boolean, If true, the transaction will  be propagated to the public mempool
                             //   through Fiber's internal network. Defaults to false.
                             //   WARNING: Using this flag will void the privacy guarantees of the transactions, making it
                             //   frontrunnable by MEV searchers.
      sendAsBundle,          // (Optional) Boolean, If true, the transaction will be sent as a bundle to the builders.
                             //   This option can significantly speed up on-chain inclusion. Defaults to false.
      retryUntil,            // (Optional) String, a hex encoded block number until which the transaction should be retried
                             //   with the same parameters if it is not included in the target block. Only valid if
                             //   `sendAsBundle` is set to true. Default to current block number + 25.
    }
  ]
}
```

:::info
You can also omit the `params` object in the request and just include the signed transaction as a hex string like so:

```js
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendPrivateRawTransaction",
  "params": [
    "0x..." // String, the signed private transaction to execute
  ]
}
```

In this case, the transaction will be forwarded to all available builders that support receiving private transactions.
:::

#### Successful response

Here is the successful response format that you can expect from the API:

```js
{
  "jsonrpc": "2.0",
  "id": "123",
  "result": {
    txHash,              // String, the transaction hash of the private transaction.
    receiptNotification, // (Optional) object containing the on-chain receipt of the transaction.
                         //   This field will only be present if you specified the `awaitReceipt` flag
                         //   in the request. See below for more details.
    bundleHash,          // (Optional) String, a unique 256-bit bundle identifier, based on the payload.
                         //   This field will only be present if you specified the `sendAsBundle` flag
                         //   as true in the request. It can be used to cancel pending transactions that
                         //   were sent as bundles, but not yet included in a block.
  }
}
```

### Transaction Receipt Notification

If you set the `awaitReceipt` flag to **true** in the request params,
the response will also include the `receiptNotification` field, which will be one of the following:

```js
{
  // ...,
  "receiptNotification": {
    status: "included" | "timedOut", // "included" if the transaction was included in a block, "timedOut" if the
                                     // "awaitReceiptTimeoutMs" (default: 60s) was reached without inclusion.
    data: {
      blockNumber, // Number, the block number in which the transaction was included. Only present if status == "included"
      elapsedMs    // Number, the time (in milliseconds) since the bundle was submitted. Always present.
    }
  }
}
```

## `echo_status`

---

This endpoint can be used to fetch information about the status of the Echo API.
This is mainly useful for testing your API key and connectivity.

```js
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "echo_status",
  "params": [
    {} // Empty object
  ]
}
```

#### Successful response

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": "online"
}
```
