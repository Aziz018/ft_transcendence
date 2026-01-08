#!/bin/sh

# set the kibana_system password
curl --silent --fail --cacert /certs/ca/ca.crt -u elastic:${ELASTIC_PASSWORD} "https://elasticsearch:9200/_security/user/kibana_system/_password" -H "Content-Type: application/json" -d '{"password": "'${KIBANA_SYSTEM_PASSWORD}'"}'

if [ $? -eq 0 ]; then
    echo "resting kibana_system password: done Successfully!"
	exit 0
else
    echo "resting kibana_system password : Failed!!"
	exit 1
fi
