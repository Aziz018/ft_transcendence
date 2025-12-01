#!/bin/sh

# Load Index Lifecycle Management Policy for ft_transcendence_logs index
#curl -s -k -u elastic:${ELASTIC_PASSWORD} -X PUT https://elasticsearch:9200/_ilm/policy/ft_transcendence_logs-policy -H "Content-Type: application/json" -d @indexLifecyclePolicy/ft_transcendence_logs-policy.json

# Load Index Template for ft_transcendence_logs index
curl -s -k -u elastic:${ELASTIC_PASSWORD} -X PUT https://elasticsearch:9200/_index_template/ft_transcendence_logs-template -H "Content-Type: application/json" -d @indexTemplate/ft_transcendence_logs-template.json

# Create Data Stream for ft_transcendence_logs
#curl -s -k -u elastic:${ELASTIC_PASSWORD} -X PUT https://elasticsearch:9200/_data_stream/ft_transcendence_logs