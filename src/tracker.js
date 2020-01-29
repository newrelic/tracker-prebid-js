import * as nrvideo from 'newrelic-video-core'
import { version } from '../package.json'

export default class PrebidTracker extends nrvideo.Tracker {
  /**
   * This static methods initializes the GPT tracker. Will be automatically called.
   * @static
   * @returns {object} Tracker reference.
   */
  static init (pbjs) {
    nrvideo.Log.debug('PrebidTracker init ', pbjs)

    // Look for an existing prebid tracker instance
    let trackers = nrvideo.Core.getTrackers()
    for (let i = 0 ; i < trackers.length ; i++) {
      if (trackers[i] instanceof PrebidTracker) {
        return null
      }
    }

    let tracker = new PrebidTracker()

    /**
     * Prebid lib version
     * @private
     */
    tracker._pbVersion = pbjs.version

    nrvideo.Core.addTracker(tracker)
    tracker.registerListeners(pbjs)
    return tracker
  }

  /**
   * Constructor
   */
  constructor (options) {
    super(options)

    this.reset()
  }

  /** Resets all flags and chronos. */
  reset () {
    /**
     * Time since last BID_ADD_AD_UNITS event, in milliseconds.
     * @private
     */
    this._timeSinceBidAddAdUnits = new nrvideo.Chrono()

    /**
     * Time since last BID_REQUEST_BIDS event, in milliseconds.
     * @private
     */
    this._timeSinceBidRequestBids = new nrvideo.Chrono()

    /**
     * Time since last BID_AUCTION_INIT event, in milliseconds.
     * @private
     */
    this._timeSinceBidAuctionInit = new nrvideo.Chrono()

    /**
     * Time since last BID_AUCTION_END event, in milliseconds.
     * @private
     */
    this._timeSinceBidAuctionEnd = new nrvideo.Chrono()

    /**
     * Time since last BID_SET_TARGETING event, in milliseconds.
     * @private
     */
    this._timeSinceBidSetTargeting = new nrvideo.Chrono()

    /**
     * Time since last BID_REQUESTED event, in milliseconds.
     * @private
     */
    //this._timeSinceBidRequested = new nrvideo.Chrono()

    /**
     * Time since last BID_RESPONSE event, in milliseconds.
     * @private
     */
    //this._timeSinceBidResponse = new nrvideo.Chrono()

    /**
     * Time since last BID_BIDDER_DONE event, in milliseconds.
     * @private
     */
    //this._timeSinceBidBidderDone = new nrvideo.Chrono()

    /**
     * Time since last BID_WON event, in milliseconds.
     * @private
     */
    //this._timeSinceBidWon = new nrvideo.Chrono()
  }

  /**
   * Returns tracker name.
   * @returns {String} Tracker name.
   */
  getTrackerName () {
    return 'prebid'
  }

  /**
   * Returns tracker version. Fetched from package.
   * @returns {String} Tracker version.
   */
  getTrackerVersion () {
    return version
  }

  /**
   * Register listeners.
   */
  registerListeners (pbjs) {
    pbjs.onEvent('auctionInit', this.onAuctionInit.bind(this))
    pbjs.onEvent('auctionEnd', this.onAuctionEnd.bind(this))
    //pbjs.onEvent('bidAdjustment', this.onBidAdjustment.bind(this))
    pbjs.onEvent('bidTimeout', this.onBidTimeout.bind(this))
    pbjs.onEvent('bidRequested', this.onBidRequested.bind(this))
    pbjs.onEvent('bidResponse', this.onBidResponse.bind(this))
    pbjs.onEvent('bidWon', this.onBidWon.bind(this))
    pbjs.onEvent('setTargeting', this.onSetTargeting.bind(this))
    pbjs.onEvent('requestBids', this.onRequestBids.bind(this))
    pbjs.onEvent('addAdUnits', this.onAddAdUnits.bind(this))
    pbjs.onEvent('adRenderFailed', this.onAdRenderFailed.bind(this))
    pbjs.onEvent('bidderDone', this.onBidderDone.bind(this))
  }

  /**
   * Parses bid object to create attributes to send to new relic.
   */
  parseBidAttributes (attributes) {
    attributes = attributes || {}

    attributes["libVersion"] = this._pbVersion
    
    // Generate time since attributes
    attributes["timeSinceBidAddAdUnits"] = this._timeSinceBidAddAdUnits.getDeltaTime()
    attributes["timeSinceBidRequestBids"] = this._timeSinceBidRequestBids.getDeltaTime()
    attributes["timeSinceBidAuctionInit"] = this._timeSinceBidAuctionInit.getDeltaTime()
    attributes["timeSinceBidAuctionEnd"] = this._timeSinceBidAuctionEnd.getDeltaTime()
    attributes["timeSinceBidSetTargeting"] = this._timeSinceBidSetTargeting.getDeltaTime()
    /*
    attributes["timeSinceBidRequested"] = this._timeSinceBidRequested.getDeltaTime()
    attributes["timeSinceBidResponse"] = this._timeSinceBidResponse.getDeltaTime()
    attributes["timeSinceBidBidderDone"] = this._timeSinceBidBidderDone.getDeltaTime()
    attributes["timeSinceBidWon"] = this._timeSinceBidWon.getDeltaTime()
    */

    return attributes
  }

  /**
   * Parses slot specific (ad unit) attributes.
   */
  parseSlotSpecificAttributes (data) {
    let attr = {
      "bidderCode": data["bidderCode"],
      "mediaType": data["mediaType"],
      "adUnitCode": data["adUnitCode"],
      "size": data["width"] + 'x' + data["height"]
    }

    if (data["adserverTargeting"] != undefined) {
      attr = Object.assign(attr, {
        "hbBidder" : data["adserverTargeting"]["hb_bidder"],
        "hbFormat" : data["adserverTargeting"]["hb_format"],
        "hbPb" : data["adserverTargeting"]["hb_pb"],
        "hbSize" : data["adserverTargeting"]["hb_size"],
        //"hbAdid" : data["adserverTargeting"]["hb_adid"],
        //"hbSource" : data["adserverTargeting"]["hb_source"]
      })
    }

    if (Array.isArray(data["params"])) {
      if (data["params"].length > 0) {
        //TODO: hardcoded first position of array. Is it correct? We should test with multiple bidders
        let firstParam = data["params"][0]
        if (firstParam["placementId"] != undefined) {
          attr["placementId"] = firstParam["placementId"]
        }
      }
    }

    return attr
  }

  /**
   * Parses bidder specific attributes.
   */
  parseBidderSpecificAttributes (data) {
    let attr = {
      "bidderCode": data["bidderCode"],
      "referer": data["refererInfo"]["referer"]
    }
    return attr
  }

  /**
   * Called once Prebid fires 'auctionInit' event.
   */
  onAuctionInit (data) {
    nrvideo.Log.debug('onAuctionInit, data =', data)
    this.send('BID_AUCTION_INIT', this.parseBidAttributes())
    this._timeSinceBidAuctionInit.start()
  }

  /**
   * Called once Prebid fires 'auctionEnd' event.
   */
  onAuctionEnd (data) {
    nrvideo.Log.debug('onAuctionEnd, data =', data)
    this.send('BID_AUCTION_END', this.parseBidAttributes())
    this._timeSinceBidAuctionEnd.start()
  }

  /**
   * Called once Prebid fires 'bidAdjustment' event.
   */
  onBidAdjustment (data) {
    nrvideo.Log.debug('onBidAdjustment, data =', data)
    let attr = this.parseSlotSpecificAttributes(data)
    this.send('BID_ADJUSTMENT', this.parseBidAttributes(attr))
  }

  /**
   * Called once Prebid fires 'bidTimeout' event.
   */
  onBidTimeout (data) {
    nrvideo.Log.debug('onBidTimeout, data =', data)
    this.send('BID_TIMEOUT', this.parseBidAttributes())
  }

  /**
   * Called once Prebid fires 'bidRequested' event.
   */
  onBidRequested (data) {
    nrvideo.Log.debug('onBidRequested, data =', data)
    let attr = this.parseBidderSpecificAttributes(data)
    this.send('BID_REQUESTED', this.parseBidAttributes(attr))
    //this._timeSinceBidRequested.start()
  }

  /**
   * Called once Prebid fires 'bidResponse' event.
   */
  onBidResponse (data) {
    nrvideo.Log.debug('onBidResponse, data =', data)
    let attr = this.parseSlotSpecificAttributes(data)
    this.send('BID_RESPONSE', this.parseBidAttributes(attr))
    //this._timeSinceBidResponse.start()
  }

  /**
   * Called once Prebid fires 'bidWon' event.
   */
  onBidWon (data) {
    nrvideo.Log.debug('onBidWon, data =', data)
    let attr = this.parseSlotSpecificAttributes(data)
    this.send('BID_WON', this.parseBidAttributes(attr))
    //this._timeSinceBidWon.start()
  }

  /**
   * Called once Prebid fires 'setTargeting' event.
   */
  onSetTargeting (data) {
    nrvideo.Log.debug('onSetTargeting, data =', data)
    this.send('BID_SET_TARGETING', this.parseBidAttributes())
    this._timeSinceBidSetTargeting.start()
  }

  /**
   * Called once Prebid fires 'requestBids' event.
   */
  onRequestBids (data) {
    nrvideo.Log.debug('onRequestBids, data =', data)
    this.send('BID_REQUEST_BIDS', this.parseBidAttributes())
    this._timeSinceBidRequestBids.start()
  }

  /**
   * Called once Prebid fires 'addAdUnits' event.
   */
  onAddAdUnits (data) {
    nrvideo.Log.debug('onAddAdUnits, data =', data)
    this.send('BID_ADD_AD_UNITS', this.parseBidAttributes())
    this._timeSinceBidAddAdUnits.start()
  }

  /**
   * Called once Prebid fires 'adRenderFailed' event.
   */
  onAdRenderFailed (data) {
    nrvideo.Log.debug('onAdRenderFailed, data =', data)
    this.send('BID_AD_RENDER_FAILED', this.parseBidAttributes())
  }

  /**
   * Called once Prebid fires 'bidderDone' event.
   */
  onBidderDone (data) {
    nrvideo.Log.debug('onBidderDone, data =', data)
    let attr = this.parseBidderSpecificAttributes(data)
    this.send('BID_BIDDER_DONE', this.parseBidAttributes(attr))
    //this._timeSinceBidBidderDone.start()
  }
}
