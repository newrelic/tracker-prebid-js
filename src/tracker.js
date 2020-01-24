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

    let trackers = nrvideo.Core.getTrackers()
    for (let i = 0 ; i < trackers.length ; i++) {
      if (trackers[i] instanceof PrebidTracker) {
        return null
      }
    }

    let tracker = new PrebidTracker()

    /**
     * Internal reference to prebid object.
     * @private
     */
    tracker._pbjs = pbjs

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

    //----------
    //----------
    //----------

    /**
     * Time since last BID_ event, in milliseconds.
     * @private
     */
    this._timeSinceBid = new nrvideo.Chrono()
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
    pbjs.onEvent('bidAdjustment', this.onBidAdjustment.bind(this))
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
  parseBidAttributes (data) {
    let attributes = {}

    if (data != undefined) {
      attributes["bidderCode"] = "bidderCode" in data ? data["bidderCode"] : undefined
      attributes["mediaType"] = "mediaType" in data ? data["mediaType"] : undefined

      //TODO: generate attributes from event's data
    }
    
    // Generate time since attributes
    attributes["timeSinceBidAddAdUnits"] = this._timeSinceBidAddAdUnits.getDeltaTime()

    return attributes
  }

  /**
   * Called once Prebid fires 'auctionInit' event.
   */
  onAuctionInit (data) {
    nrvideo.Log.debug('onAuctionInit, data =', data)
    this.send('BID_AUCTION_INIT', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'auctionEnd' event.
   */
  onAuctionEnd (data) {
    nrvideo.Log.debug('onAuctionEnd, data =', data)
    this.send('BID_AUCTION_END', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'bidAdjustment' event.
   */
  onBidAdjustment (data) {
    nrvideo.Log.debug('onBidAdjustment, data =', data)
    this.send('BID_ADJUSTMENT', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'bidTimeout' event.
   */
  onBidTimeout (data) {
    nrvideo.Log.debug('onBidTimeout, data =', data)
    this.send('BID_TIMEOUT', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'bidRequested' event.
   */
  onBidRequested (data) {
    nrvideo.Log.debug('onBidRequested, data =', data)
    this.send('BID_REQUESTED', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'bidResponse' event.
   */
  onBidResponse (data) {
    nrvideo.Log.debug('onBidResponse, data =', data)
    this.send('BID_RESPONSE', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'bidWon' event.
   */
  onBidWon (data) {
    nrvideo.Log.debug('onBidWon, data =', data)
    this.send('BID_WON', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'setTargeting' event.
   */
  onSetTargeting (data) {
    nrvideo.Log.debug('onSetTargeting, data =', data)
    this.send('BID_SET_TARGETING', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'requestBids' event.
   */
  onRequestBids (data) {
    nrvideo.Log.debug('onRequestBids, data =', data)
    this.send('BID_REQUEST_BIDS', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'addAdUnits' event.
   */
  onAddAdUnits (data) {
    nrvideo.Log.debug('onAddAdUnits, data =', data)
    this.send('BID_ADD_AD_UNITS', this.parseBidAttributes(data))
    this._timeSinceBidAddAdUnits.start()
  }

  /**
   * Called once Prebid fires 'adRenderFailed' event.
   */
  onAdRenderFailed (data) {
    nrvideo.Log.debug('onAdRenderFailed, data =', data)
    this.send('BID_AD_RENDER_FAILED', this.parseBidAttributes(data))
  }

  /**
   * Called once Prebid fires 'bidderDone' event.
   */
  onBidderDone (data) {
    nrvideo.Log.debug('onBidderDone, data =', data)
    this.send('BID_BIDDER_DONE', this.parseBidAttributes(data))
  }
}
