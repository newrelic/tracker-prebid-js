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
  onAuctionInit (data) {
    nrvideo.Log.debug('onAuctionInit, data =', data)
  }

  /**
   * Called once Prebid fires 'auctionEnd' event.
   */
  onAuctionEnd (data) {
    nrvideo.Log.debug('onAuctionEnd, data =', data)
  }

  /**
   * Called once Prebid fires 'bidAdjustment' event.
   */
  onBidAdjustment (data) {
    nrvideo.Log.debug('onBidAdjustment, data =', data)
  }

  /**
   * Called once Prebid fires 'bidTimeout' event.
   */
  onBidTimeout (data) {
    nrvideo.Log.debug('onBidTimeout, data =', data)
  }

  /**
   * Called once Prebid fires 'bidRequested' event.
   */
  onBidRequested (data) {
    nrvideo.Log.debug('onBidRequested, data =', data)
  }

  /**
   * Called once Prebid fires 'bidResponse' event.
   */
  onBidResponse (data) {
    nrvideo.Log.debug('onBidResponse, data =', data)
  }

  /**
   * Called once Prebid fires 'bidWon' event.
   */
  onBidWon (data) {
    nrvideo.Log.debug('onBidWon, data =', data)
  }

  /**
   * Called once Prebid fires 'setTargeting' event.
   */
  onSetTargeting (data) {
    nrvideo.Log.debug('onSetTargeting, data =', data)
  }

  /**
   * Called once Prebid fires 'requestBids' event.
   */
  onRequestBids (data) {
    nrvideo.Log.debug('onRequestBids, data =', data)
  }

  /**
   * Called once Prebid fires 'addAdUnits' event.
   */
  onAddAdUnits (data) {
    nrvideo.Log.debug('onAddAdUnits, data =', data)
  }

  /**
   * Called once Prebid fires 'adRenderFailed' event.
   */
  onAdRenderFailed (data) {
    nrvideo.Log.debug('onAdRenderFailed, data =', data)
  }

  /**
   * Called once Prebid fires 'bidderDone' event.
   */
  onBidderDone (data) {
    nrvideo.Log.debug('onBidderDone, data =', data)
  }
}
