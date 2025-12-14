#!/bin/sh
dashboard_file="node-exporter.json"
GRAFANA_HOST=grafana-container

# create datasource 
curl --location "http://$GRAFANA_HOST:3000/api/datasources" \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data '{
  "name":"prometheus data source",
  "type":"prometheus",
  "url":"http://prometheus-container:9090",
  "uid":"prometheus-container",
  "access":"proxy",
  "basicAuth":false
}'

if [ ! -f "$dashboard_file" ]; then
    curl -o "$dashboard_file" https://grafana.com/api/dashboards/1860/revisions/41/download
    if [ $? -ne 0 ]; then
        echo "Failed to download dashboard file."
        exit 1
    fi
fi
# create grafana dashboard by importing JSON file
jq -n --slurpfile dashboard $dashboard_file '{"dashboard": $dashboard[0], "overwrite": true, "folderId": 0}' | \
curl --location "http://$GRAFANA_HOST:3000/api/dashboards/db" \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data-binary @-


