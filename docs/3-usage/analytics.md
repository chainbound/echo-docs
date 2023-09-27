---
sidebar_position: 1
title: Analytics
---
--------

Echo currently supports the following methods to query user analytics:

## `echo_getBundleStats`

---

This endpoint can be used to fetch information about a specific bundle sent to Echo.

```js
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "echo_getBundleStats",
  "params": [
    {
      bundleHash, // String, the bundle hash of the bundle you want to get stats for
    }
  ]
}
```

#### Successful response

Here is the successful response format that you can expect from the API:

```js
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    [
      {
        bundleHash,  // String, the bundle hash of the bundle you requested stats for
        included,    // Boolean, true if the bundle was included in a block, false otherwise
        timestamp,   // Number, the timestamp (in milliseconds) when the bundle was included in a block
        blockNumber, // Number, the block number in which the bundle was included
        blockBuilder // String, the name of the builder that included the bundle
      },
      ...            // Additional bundles with the same bundleHash can be returned if they exist
    ]
  }
}
```

## `echo_getInclusionStats`

---

This endpoint can be used to fetch information about the inclusion details of the bundles you send through Echo.

```js
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "echo_getInclusionStats",
  "params": [
    {} // Empty object
  ]
}
```

#### Successful response

Here is the successful response format that you can expect from the API:

```js
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    avgInclusionDelay,   // Number, the average delay (in milliseconds) between bundle submission and inclusion in a block
    inclusionRate,       // Number, the ratio of bundles sent through Echo that were included in a block
    bundlesIncludedByBuilder: [
      {
        blockBuilder,    // String, the name of the builder
        bundlesIncluded, // Number, the number of bundles included by this builder
      },
      ...                // Each builder that included at least one of your bundles will be returned
    ]
  }
}
```