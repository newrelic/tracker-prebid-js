import { Core } from 'newrelic-tracker-core'

Core.setEventType("PrebidEvent")

// Re-export core
export * from 'newrelic-tracker-core'

// Export Prebid tracker
export { PrebidTracker } from './tracker'