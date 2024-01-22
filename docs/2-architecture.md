---
sidebar_position: 1
title: Architecture
---
------

**Echo** is a service developed by [Chainbound](https://www.chainbound.io/) 
which leverages the [Fiber Network](https://fiber.chainbound.io/docs/intro).  

Echo **extends Fiber's functionalities** by integrating with the **Proposer-Builder Separation (PBS) architecture**, 
allowing users to directly send transactions and bundles to Block Builders. 

------
## Transaction & Bundle Flow 
![](/img/echo-diagram.jpg)
Following the infrographic depicted up here, users should expect the following flow: 
1. **User submits an MEV bundle** via `https://v1.echo-rpc.io` endpoint with `eth_sendBundle` method.
2. **Echo picks up the bundle** and depending on user preferences:  
       A. Echo routes the bundle to the builders specified in `mevBuilders` field.  
       B. If user specified `usePublicMempool: true`, Echo also propagates the transaction to the public mempool.
> Here, Echo leverages the [Fiber network](https://fiber.chainbound.io/docs/usage/transaction_broad)'s `SendTransaction` functionality, ensuring a fast and reliable propagation worldwide.
1. **Builders submit their blocks** to relays. At the end of the PBS auction, proposers select the block with the highest bid (not depicted in diagram). 
2. **New block is broadcasted** to the network.
3. **Receipt notification**: As soon as the user's transactions are included in a block, Echo notifies the user with a receipt notification.

   > Here Echo leverages the Fiber network's `NewExecutionPayloads` stream, allowing the system to check for transaction inclusion in newly produced blocks with minimal latency.
