/**
 * Client Configuration for Event Monitoring
 *
 * This file contains the configuration for monitoring Google Analytics events.
 * To add a new client, simply create a new client configuration object following
 * the same structure and add it to the clients object.
 */

// Default thresholds that apply to all events unless overridden
const DEFAULT_THRESHOLDS = {
  threshold_percentage: 25,
  std_dev_multiplier: 1.5,
  min_average: 10
};


// Client-specific configurations
const clients = {
  // BossLaser configuration
  bosslaser: {
    client_id: "bosslaser",
    ga_property_id: "308825090",
    project_id: "gtm-tlws88nt-yjy2m",
    dataset_id: "analytics_308825090",
    events_list: ["quote_created", "session_start", "purchase"],
    // Default thresholds for all events
    ...DEFAULT_THRESHOLDS,
    // Event-specific configurations (override defaults)
    event_configs: {
      purchase: {
        threshold_percentage: 15,  // More sensitive for purchase events
        std_dev_multiplier: 2.0,
        min_average: 5
      },
      quote_created: {
        threshold_percentage: 20,
        std_dev_multiplier: 1.8,
        min_average: 8
      }
    }
  },

  // Template for adding new clients
  // Uncomment and fill in the values for a new client
  /*
  new_client: {
    client_id: "new_client",
    ga_property_id: "YOUR_GA_PROPERTY_ID",
    project_id: "YOUR_GCP_PROJECT_ID",
    dataset_id: "YOUR_GA_DATASET_ID",
    events_list: ["event1", "event2", "event3"],
    // Default thresholds for all events
    ...DEFAULT_THRESHOLDS,
    // Event-specific configurations (override defaults)
    event_configs: {
      event1: {
        threshold_percentage: 20,
        std_dev_multiplier: 1.8,
        min_average: 8
      }
    }
  }
  */
};

// Set the active client ID here
const ACTIVE_CLIENT_ID = "bosslaser";

// Export the active client configuration
module.exports = {
  // Get the active client configuration
  clientConfig: clients[ACTIVE_CLIENT_ID],

  // Helper function to get configuration for a specific client
  getClientConfig: function(clientId) {
    return clients[clientId] || null;
  },

  // Helper function to get event-specific thresholds
  getEventThresholds: function(clientId, eventName) {
    const client = clients[clientId];
    if (!client) return null;

    // Return event-specific config if available, otherwise return default
    return client.event_configs && client.event_configs[eventName]
      ? client.event_configs[eventName]
      : {
          threshold_percentage: client.threshold_percentage,
          std_dev_multiplier: client.std_dev_multiplier,
          min_average: client.min_average
        };
  }
};
