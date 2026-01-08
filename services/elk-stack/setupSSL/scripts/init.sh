#!/bin/bash

echo "Starting SSL certificate generation..."

# Check if certificates already exist
if [ -f certs/ca/ca.key ] && [ -f certs/ca/ca.crt ] && [ -f certs/elasticsearch/elasticsearch.key ] && [ -f certs/elasticsearch/elasticsearch.crt ] && [ -f certs/kibana/kibana.key ] && [ -f certs/kibana/kibana.crt ]; then
	echo "Certificates already exist. Skipping generation."
	exit 0
fi

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate a self-signed CA certificate
echo "Generating CA certificate..."
elasticsearch-certutil ca --pem --days 3650 --out certs/elastic-stack-ca.zip

unzip certs/elastic-stack-ca.zip -d certs

# Generate certificates for Elasticsearch nodes and Kibana
echo "Generating Elasticsearch and Kibana certificates..."
elasticsearch-certutil cert --pem --ca-cert certs/ca/ca.crt --ca-key certs/ca/ca.key --in config/instances.yml --days 3650 --out certs/certificates.zip

unzip certs/certificates.zip -d certs

# Cleanup
rm certs/elastic-stack-ca.zip certs/certificates.zip

# files should exist:	- certs/ca/ca.crt
#						-  certs/ca/ca.key
#						-  certs/elasticsearch/elasticsearch.crt
#						-  certs/elasticsearch/elasticsearch.key
#						-  certs/kibana/kibana.crt
#						-  certs/kibana/kibana.key
# Verify that all files were created
if [ -f certs/ca/ca.key ] && [ -f certs/ca/ca.crt ] && [ -f certs/elasticsearch/elasticsearch.key ] && [ -f certs/elasticsearch/elasticsearch.crt ] && [ -f certs/kibana/kibana.key ] && [ -f certs/kibana/kibana.crt ]; then
	echo "Certificates generated successfully."
else
	echo "Error: Certificate generation failed."
	exit 1
fi

exit 0