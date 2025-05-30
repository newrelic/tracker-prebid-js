import {Core, VideoTracker, Chrono, Log} from 'newrelic-video-core'
import packageInfo from '../package.json'

export class PrebidTracker extends VideoTracker {
  /**
   * This static methods initializes the GPT tracker. Will be automatically called.
   * @static
   * @returns {object} Tracker reference.
   */
  static init (pbjs) {
    Log.debug('PrebidTracker init ', pbjs)

    // Look for an existing prebid tracker instance
    let trackers = Core.getTrackers()
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

    Core.addTracker(tracker)
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
    this._timeSinceBidAddAdUnits = new Chrono()

    /**
     * Time since last BID_REQUEST_BIDS event, in milliseconds.
     * @private
     */
    this._timeSinceBidRequestBids = new Chrono()

    /**
     * Time since last BID_AUCTION_INIT event, in milliseconds.
     * @private
     */
    this._timeSinceBidAuctionInit = new Chrono()

    /**
     * Time since last BID_AUCTION_END event, in milliseconds.
     * @private
     */
    this._timeSinceBidAuctionEnd = new Chrono()

    /**
     * Time since last BID_SET_TARGETING event, in milliseconds.
     * @private
     */
    this._timeSinceBidSetTargeting = new Chrono()

    /**
     * Bidder specific attributes.
     * @private
     */
    this._bidderAttributes = {}

    /**
     * Slot specific attributes.
     * @private
     */
    this._slotAttributes = {}
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
    return packageInfo.version
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
   * Generate bid generic attributes.
   */
  generateBidGenericAttributes (attributes) {
    attributes = attributes || {}

    attributes["libVersion"] = this._pbVersion
    
    // Generate time since attributes
    attributes["timeSinceBidAddAdUnits"] = this._timeSinceBidAddAdUnits.getDeltaTime()
    attributes["timeSinceBidRequestBids"] = this._timeSinceBidRequestBids.getDeltaTime()
    attributes["timeSinceBidAuctionInit"] = this._timeSinceBidAuctionInit.getDeltaTime()
    attributes["timeSinceBidAuctionEnd"] = this._timeSinceBidAuctionEnd.getDeltaTime()
    attributes["timeSinceBidSetTargeting"] = this._timeSinceBidSetTargeting.getDeltaTime()

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
        "hbAdid" : data["adserverTargeting"]["hb_adid"],
        "hbSource" : data["adserverTargeting"]["hb_source"]
      })
    }

    if (Array.isArray(data["params"])) {
      if (data["params"].length > 0) {
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
   * Add timer to bidder
   */
  addTimerToBidder (bidderCode, timerName) {
    let crono = new Chrono()
    crono.start()
    if (this._bidderAttributes[bidderCode] == undefined) {
      this._bidderAttributes[bidderCode] = {}
    }
    this._bidderAttributes[bidderCode][timerName] = crono
  }

  /**
   * Add timer to slot
   */
  addTimerToSlot (adUnitCode, timerName) {
    let crono = new Chrono()
    crono.start()
    if (this._slotAttributes[adUnitCode] == undefined) {
      this._slotAttributes[adUnitCode] = {}
    }
    this._slotAttributes[adUnitCode][timerName] = crono
  }

  /**
   * Generate timer attributes for a certain bidder code
   */
  generateTimerAttributesForBidder (bidderCode, attr) {
    if (this._bidderAttributes[bidderCode] != undefined) {
      for (const [key, value] of Object.entries(this._bidderAttributes[bidderCode])) {
        attr[key] = value.getDeltaTime()
      }
    }
    return attr
  }

  /**
   * Generate timer attributes for a certain Ad Units code
   */
  generateTimerAttributesForSlot (adUnitCode, attr) {
    if (this._slotAttributes[adUnitCode] != undefined) {
      for (const [key, value] of Object.entries(this._slotAttributes[adUnitCode])) {
        attr[key] = value.getDeltaTime()
      }
    }
    return attr
  }

  /**
   * Called once Prebid fires 'auctionInit' event.
   */
  onAuctionInit (data) {
    Log.debug('onAuctionInit, data =', data)
    this.send('BID_AUCTION_INIT', this.generateBidGenericAttributes())
    this._timeSinceBidAuctionInit.start()
  }

  /**
   * Called once Prebid fires 'auctionEnd' event.
   */
  onAuctionEnd (data) {
    Log.debug('onAuctionEnd, data =', data)
    this.send('BID_AUCTION_END', this.generateBidGenericAttributes())
    this._timeSinceBidAuctionEnd.start()
  }

  /**
   * Called once Prebid fires 'bidAdjustment' event.
   */
  onBidAdjustment (data) {
    Log.debug('onBidAdjustment, data =', data)
    let attr = this.parseSlotSpecificAttributes(data)
    this.send('BID_ADJUSTMENT', this.generateBidGenericAttributes(attr))
  }

  /**
   * Called once Prebid fires 'bidTimeout' event.
   */
  onBidTimeout (data) {
    Log.debug('onBidTimeout, data =', data)
    this.send('BID_TIMEOUT', this.generateBidGenericAttributes())
  }

  /**
   * Called once Prebid fires 'bidRequested' event.
   */
  onBidRequested (data) {
    Log.debug('onBidRequested, data =', data)
    let attr = this.parseBidderSpecificAttributes(data)
    attr = this.generateTimerAttributesForBidder(attr["bidderCode"], attr)
    this.send('BID_REQUESTED', this.generateBidGenericAttributes(attr))
    this.addTimerToBidder(attr["bidderCode"], "timeSinceBidRequested")
  }

  /**
   * Called once Prebid fires 'bidResponse' event.
   */
  onBidResponse (data) {
    Log.debug('onBidResponse, data =', data)
    let attr = this.parseSlotSpecificAttributes(data)
    attr = this.generateTimerAttributesForBidder(attr["bidderCode"], attr)
    attr = this.generateTimerAttributesForSlot(attr["adUnitCode"], attr)
    this.send('BID_RESPONSE', this.generateBidGenericAttributes(attr))
    this.addTimerToBidder(attr["bidderCode"], "timeSinceBidResponse")
    this.addTimerToSlot(attr["adUnitCode"], "timeSinceBidResponse")
  }

  /**
   * Called once Prebid fires 'bidWon' event.
   */
  onBidWon (data) {
    Log.debug('onBidWon, data =', data)
    let attr = this.parseSlotSpecificAttributes(data)
    attr = this.generateTimerAttributesForBidder(attr["bidderCode"], attr)
    attr = this.generateTimerAttributesForSlot(attr["adUnitCode"], attr)
    this.send('BID_WON', this.generateBidGenericAttributes(attr))
    this.addTimerToBidder(attr["bidderCode"], "timeSinceBidWon")
    this.addTimerToSlot(attr["adUnitCode"], "timeSinceBidWon")
  }

  /**
   * Called once Prebid fires 'setTargeting' event.
   */
  onSetTargeting (data) {
    Log.debug('onSetTargeting, data =', data)
    this.send('BID_SET_TARGETING', this.generateBidGenericAttributes())
    this._timeSinceBidSetTargeting.start()
  }

  /**
   * Called once Prebid fires 'requestBids' event.
   */
  onRequestBids (data) {
    Log.debug('onRequestBids, data =', data)
    this.send('BID_REQUEST_BIDS', this.generateBidGenericAttributes())
    this._timeSinceBidRequestBids.start()
  }

  /**
   * Called once Prebid fires 'addAdUnits' event.
   */
  onAddAdUnits (data) {
    Log.debug('onAddAdUnits, data =', data)
    this.send('BID_ADD_AD_UNITS', this.generateBidGenericAttributes())
    this._timeSinceBidAddAdUnits.start()
  }

  /**
   * Called once Prebid fires 'adRenderFailed' event.
   */
  onAdRenderFailed (data) {
    Log.debug('onAdRenderFailed, data =', data)
    this.send('BID_AD_RENDER_FAILED', this.generateBidGenericAttributes())
  }

  /**
   * Called once Prebid fires 'bidderDone' event.
   */
  onBidderDone (data) {
    Log.debug('onBidderDone, data =', data)
    let attr = this.parseBidderSpecificAttributes(data)
    attr = this.generateTimerAttributesForBidder(attr["bidderCode"], attr)
    this.send('BID_BIDDER_DONE', this.generateBidGenericAttributes(attr))
    this.addTimerToBidder(attr["bidderCode"], "timeSinceBidBidderDone")
  }
}
