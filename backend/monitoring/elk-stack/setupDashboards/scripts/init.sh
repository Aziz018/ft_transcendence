#!/bin/sh

# import saved objects into Kibana. Option --overwrite=true to overwrite existing objects
curl -s -k -u elastic:${ELASTIC_PASSWORD}  -X POST https://kibana:5601/api/saved_objects/_import?overwrite=true -H "kbn-xsrf: true" --form file=@dashboards/export.ndjson
