#!/bin/bash

# Usage: ./deploy.sh <GCP_PROJECT_ID> <ANALYTICS_TABLE> <DATASET> <EVENTS_LIST>
# Example: ./deploy.sh my-gcp-project analytics_123456 my-gcp-project "event1#event2#event3"

if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <GCP_PROJECT_ID> <ANALYTICS_TABLE> <DATASET> <EVENTS_LIST>"
  echo "Example: $0 my-gcp-project analytics_123456 my-gcp-project 'event1#event2#event3'"
  exit 1
fi

GCP_PROJECT_ID=$1
ANALYTICS_TABLE=$2
DATASET=$3
EVENTS_LIST=$4

cat > workflow_settings.yaml <<EOL
defaultProject: $GCP_PROJECT_ID
defaultLocation: US
defaultDataset: dataform
defaultAssertionDataset: dataform_assertions
dataformCoreVersion: 3.0.0
vars:
  analytics_table: $ANALYTICS_TABLE
  dataset: $DATASET
  events_list: $EVENTS_LIST
  
  # Anomaly detection thresholds (defaults)
  threshold_percentage: "25"
  std_dev_multiplier: "1.5"
  min_average: "10"
  
  # Event-specific thresholds (override defaults)
  purchase_threshold_percentage: "15"
  purchase_std_dev_multiplier: "2.0"
  purchase_min_average: "5"
  
  # Client identification (for logging)
  client_id: default
  dataset_id: $DATASET
EOL

echo "Compiling Dataform project..."
dataform compile

echo "Running Dataform project..."
dataform run

echo "Deployment complete."
