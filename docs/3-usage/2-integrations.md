---
sidebar_position: 1
title: Integrations
---
---------
Here is a list of the Builders currently integrated. 
Users can specify which Builders to send their bundles via the `mevBuilders` array field:

| **Builders (value)**                           |
| ---------------------------------------------- |
| `flashbots`                                    |
| `beaverbuild`                                  |
| `rsync`                                        |
| `builder0x69`                                  |
| `titan`                                        |
| `f1b`                                          |
| `blocknative`                                  |
| `nfactorial`                                   |
| `buildai`                                      |
| `all` _to explicitly set all the above values_ |

:::note
If you are a Builder interested in integrating with Echo, 
contact us on [Discord](https://discord.gg/J4KNdeCYGX) or email us at admin@chainbound.io.
:::


## Builders Features
--------
Here is a list of the builders currently supported, and the features that each one supports:


<!-- TODO(nico): redo table with better format + new builders -->

| **feature**             | **flashbots** | **beaverbuild** | **rsync** | **builder0x69** | **titan** | **f1b** |
| ----------------------- | ------------- | --------------- | --------- | --------------- | --------- | ------- |
| sendBundle              | ✅            | ✅              | ✅        | ✅              | ✅        | ✅      |
| cancelBundle            | ✅            | ❌              | ✅        | ❌              | ✅        | ✅      |
| ETH refunds             | ❌            | ❌              | ✅        | ✅              | ✅        | ✅      |
| custom refund recipient | ❌            | ❌              | ✅        | ✅              | ✅        | ✅      |
| refund on multiple txs  | ❌            | ❌              | ✅        | ❌              | ❌        | ❌      |
| X-Flashbots-Signature   | required      | -               | -         | -               | optional  | -       |

:::info
Echo API endpoint offer the ability to specify a set of `mevBuilders` to which the request should be forwarded.
In the case that no `mevBuilders` are specified, the request will be forwarded to **all available builders**.
:::


