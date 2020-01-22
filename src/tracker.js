import * as nrvideo from 'newrelic-video-core'
import { version } from '../package.json'

export default class PrebidTracker extends nrvideo.Tracker {
  /**
   * This static methods initializes the GPT tracker. Will be automatically called.
   * @static
   * @returns {object} Tracker reference.
   */
  static init () {
    let trackers = nrvideo.Core.getTrackers()
    for (let i = 0 ; i < trackers.length ; i++) {
      if (trackers[i] instanceof PrebidTracker) {
        return null
      }
    }

    let tracker = new PrebidTracker()
    nrvideo.Core.addTracker(tracker)
    tracker.registerListeners()
    return tracker
  }

  /**
   * Constructor
   */
  constructor (options) {
    super(options)

    this.reset()

    this.slots = {}
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
   * Returns given slot info, or creates a new one.
   * @param {string} slotId Unique slot id.
   */
  getSlotState (slotId) {
    if (!this.slots[slotId]) { // first time
      this.slots[slotId] = {
        chrono: new nrvideo.Chrono(),
        visible: false
      }
    }
    return this.slots[slotId]
  }

  /**
   * Register listeners.
   */
  registerListeners () {
    // TODO: register event listeners
  }

  //TODO: event listeners
}
