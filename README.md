# newrelic-prebid [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
#### [New Relic](http://newrelic.com) monitoring for Prebid

## Requirements
This solution works on top of New Relic's **Browser Pro + SPA Agent**.

## Usage
Include the scripts inside `dist` folder to your page. See `sample` folder for examples.

> If `dist` folder is not included, run `npm i && npm run build` to build it.

To initialize the tracker, call method `init()` just when the prebid objejct is ready:

```
  var pbjs = pbjs || {};
  pbjs.que = pbjs.que || [];
  
  pbjs.que.push(function() {
    // Init Prebid tracker
    nrvideo.PrebidTracker.init(pbjs)

    pbjs.addAdUnits(adUnits);
    pbjs.requestBids({
      bidsBackHandler: initAdserver,
      timeout: PREBID_TIMEOUT
    });
  });
```

## Data Model

### Actions
The following event names are sent by the tracker as Browser Agent `Custom Events`.

| Action Name | Description | Prebid Event |
|---|---|---|
| `BID_AUCTION_INIT` | The auction has started. | *auctionInit* |
| `BID_AUCTION_END` | The auction has ended. | *auctionEnd* |
| `BID_TIMEOUT` | A bid timed out. | *bidTimeout* |
| `BID_REQUESTED` | A bid was requested. | *bidRequested* |
| `BID_RESPONSE` | A bid response has arrived. | *bidResponse* |
| `BID_WON` | A bid has won. | *bidWon* |
| `BID_SET_TARGETING` | Targeting has been set. | *setTargeting* |
| `BID_REQUEST_BIDS` | Bids have been requested from adapters. | *requestBids* |
| `BID_ADD_AD_UNITS` | Ad units have been added to the auction. | *addAdUnits* |
| `BID_AD_RENDER_FAILED` | Ad rendering failed. | *adRenderFailed* |
| `BID_BIDDER_DONE` | A bidder has signaled they are done responding. | *bidderDone* |

Check out the following link for more information on [Prebid events](http://prebid.org/dev-docs/publisher-api-reference.html#module_pbjs.onEvent).

### Common Attributes
This is the list of attributes sent along with all `BID_` actions.

| Attribute | Description | Example |
|---|---|---|
| `libVersion` | Prebid version. | *v3.4.0* |
| `timeSinceBidAddAdUnits` | Time since last `BID_ADD_AD_UNITS`. | *12356784* |
| `timeSinceBidRequestBids` | Time since last `BID_REQUEST_BIDS`. | *12356784* |
| `timeSinceBidAuctionInit` | Time since last `BID_AUCTION_INIT`. | *12356784* |
| `timeSinceBidAuctionEnd` | Time since last `BID_AUCTION_END`. | *12356784* |
| `timeSinceBidSetTargeting` | Time since last `BID_SET_TARGETING`. | *12356784* |

### Slot Specific Attributes
This attributes are sent along with `BID_RESPONSE` and `BID_WON` actions.

| Attribute | Description | Example |
|---|---|---|
| `bidderCode` | Bidder code. | *appnexus* |
| `mediaType` | Media type. | *banner* |
| `adUnitCode` | Ad Unit Code. | */19968336/header-bid-tag-0* |
| `size` | Media size. | *100x200* |
| `hbBidder` | Bidder code. | *appnexus* |
| `hbFormat` | Media format. | *banner* |
| `hbPb` | Price bucket. | *0.50* |
| `hbSize` | Media size. | *100x200* |
| `placementId` | Placement ID. | *13144370* |

### Bidder Specific Attributes
This attributes are sent along with `BID_REQUESTED` and `BID_BIDDER_DONE` actions.

| Attribute | Description | Example |
|---|---|---|
| `bidderCode` | Bidder code. | *appnexus* |
| `referer` | Bid referer. | *https://www.example.com/page.html* |

### Slot Specific Time Attributes
These timers are generated per `adUnitCode` and only sent along with the actions having the same slot code. Sent with actions `BID_RESONSE` and `BID_WON`.

| Attribute | Description |
|---|---|---|
| `timeSinceBidResponse` | Time since last `BID_RESPONSE` with the same `adUnitCode`. |
| `timeSinceBidWon` | Time since last `BID_WON` with the same `adUnitCode`. |

### Bidder Specific Time Attributes
These timers are generated per `bidderCode` and only sent along with the actions having the same bidder. Sent with actions `BID_REQUESTED`, `BID_RESONSE`, `BID_WON` and `BID_BIDDER_DONE`.

| Attribute | Description |
|---|---|---|
| `timeSinceBidRequested` | Time since last `BID_REQUESTED` with the same `bidderCode`. |
| `timeSinceBidResponse` | Time since last `BID_RESPONSE` with the same `bidderCode`. |
| `timeSinceBidWon` | Time since last `BID_WON` with the same `bidderCode`. |
| `timeSinceBidBidderDone` | Time since last `BID_BIDDER_DONE` with the same `bidderCode`. |
