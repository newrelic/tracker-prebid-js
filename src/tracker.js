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
    //TODO: init timeSinceXXX attributes
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
    pbjs.onEvent('auctionInit', this.onAuctionInit)
    pbjs.onEvent('auctionEnd', this.onAuctionEnd)
    pbjs.onEvent('bidAdjustment', this.onBidAdjustment)
    pbjs.onEvent('bidTimeout', this.onBidTimeout)
    pbjs.onEvent('bidRequested', this.onBidRequested)
    pbjs.onEvent('bidResponse', this.onBidResponse)
    pbjs.onEvent('bidWon', this.onBidWon)
    pbjs.onEvent('setTargeting', this.onSetTargeting)
    pbjs.onEvent('requestBids', this.onRequestBids)
    pbjs.onEvent('addAdUnits', this.onAddAdUnits)
    pbjs.onEvent('adRenderFailed', this.onAdRenderFailed)
    pbjs.onEvent('bidderDone', this.onBidderDone)
  }

  /**
   * Called once Prebid fires 'auctionInit' event.
   */
  onAuctionInit () {
    nrvideo.Log.debug('onAuctionInit')
  }

  /**
   * Called once Prebid fires 'auctionEnd' event.
   */
  onAuctionEnd () {
    nrvideo.Log.debug('onAuctionEnd')
  }

  /**
   * Called once Prebid fires 'bidAdjustment' event.
   */
  onBidAdjustment () {
    nrvideo.Log.debug('onBidAdjustment')
  }

  /**
   * Called once Prebid fires 'bidTimeout' event.
   */
  onBidTimeout () {
    nrvideo.Log.debug('onBidTimeout')
  }

  /**
   * Called once Prebid fires 'bidRequested' event.
   */
  onBidRequested () {
    nrvideo.Log.debug('onBidRequested')
  }

  /**
   * Called once Prebid fires 'bidResponse' event.
   */
  onBidResponse () {
    nrvideo.Log.debug('onBidResponse')
  }

  /**
   * Called once Prebid fires 'bidWon' event.
   */
  onBidWon () {
    nrvideo.Log.debug('onBidWon')
  }

  /**
   * Called once Prebid fires 'setTargeting' event.
   */
  onSetTargeting () {
    nrvideo.Log.debug('onSetTargeting')
  }

  /**
   * Called once Prebid fires 'requestBids' event.
   */
  onRequestBids () {
    nrvideo.Log.debug('onRequestBids')
  }

  /**
   * Called once Prebid fires 'addAdUnits' event.
   */
  onAddAdUnits () {
    nrvideo.Log.debug('onAddAdUnits')
  }

  /**
   * Called once Prebid fires 'adRenderFailed' event.
   */
  onAdRenderFailed () {
    nrvideo.Log.debug('onAdRenderFailed')
  }

  /**
   * Called once Prebid fires 'bidderDone' event.
   */
  onBidderDone () {
    nrvideo.Log.debug('onBidderDone')
  }
}
