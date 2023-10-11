---
sidebar_position: 5
title: Change Log
---

All notable changes to Echo will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.3.0] - 2023-09-27

- Added full websocket support: you can now optionally use websockets instead of HTTP for all endpoints
- Added `eth_sendPrivateRawTransaction` endpoint: send a raw transaction directly to block builders
- Added `echo_status` endpoint for testing and stauts checks
- Fixed a bug with the `x-flashbots-signature` request header failing for some users
- Removed blocknative as a builder (they shut down their builder service)

## [0.2.0] - 2023-09-20

- Added `echo_getBundleStats` endpoint: fetch info of a specific bundle, such as if it was included in a block, when and by which builder.
- Added `echo_getInclusionStats`: fetch aggregated info about the inclusion of your MEV bundles, such as which builder is including your bundles the most, the average delay between when you send your bundles and when they are included in a block, and your "inclusion rate" defined as how many bundles you send vs how many are included in a block.

## [0.1.0] - 2023-08-31

Initial release.
