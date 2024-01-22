---
slug: echo-v1-release
title: "Echo Release V1.0: Now Globally Distributed"
authors: [nicolas]
tags: [ethereum, pbs, mev]
---

> **Introducing Echo V1.0.0:** A significant upgrade and a complete reinvention of our broadcasting service. Echo 1.0.0 offers advanced capabilities to efficiently reach block builders around the world, combining speed with reliability.

## Key Features of Echo V1.0

- **Geographic Distribution:** Echo's network now spans across the globe. Transactions and bundles are routed to block builders based on geographic proximity and efficiency. This results in quicker and more reliable broadcasting, irrespective of the user's or builders' locations.
- **Comprehensive Internal Redesign:** Echo V1.0.0 represents a total internal transformation. This is achieved mainly with two new components: Fly.io's [Corrosion](https://github.com/superfly/corrosion) as a distributed service discovery layer and shared database, and our own [MSG-RS](https://github.com/chainbound/msg-rs) messaging library for communication.

## How does it work?

![Echo V1.0 Architecture](./images/echo-v1-architecture.png)

The new architecture relies on dedicated nodes that are deployed in strategic locations around the world. **These nodes are connected to the Ethereum block builders and to each other**. This allows us to route transactions and bundles to the closest node, which then broadcasts them to the block builders.
The internal propagation is handled through a private link, which ensures that the messages are delivered to the block builders as quickly as possible.

In the above example, Bob from the United States is trying to send a bundle to a block builder in Europe. The two alternative paths are:

- **The builder's own RPC API (the orange line)**: direct connection with 150ms latency. In normal circumstances, the request will be routed through the public internet, which entails a relatively high latency when compared to datacenter-to-datacenter peerings.
- **Echo V1.0 (the blue path)**: A sum of three components: 20ms for the request to the closest Echo node, then 45ms of internal propagation time to reach the Echo node in Europe, and finally 10ms for the last leg to reach the block builder. This totals 75ms, which is 75ms faster than the direct connection in this specific example.

Of course, the actual latency will vary depending on the user's location and the block builder's own optimizations. However, Echo V1.0 will always try to find the fastest path to the block builder.

## Try it today!

Connect with our community on [Discord](https://discord.gg/4abpAT2tXw) to request
an API key and get started with Echo!

For existing users, upgrading to V1.0 is dead simple. All you have to do is change the RPC endpoint to:

- HTTP: `https://v1.echo-rpc.io`
- WS: `wss://v1.echo-rpc.io/ws`

That's it! We hope you enjoy the new speed improvements, and if you have any
questions or feedback we encourage you to reach out to us on [Discord](https://discord.gg/4abpAT2tXw).
