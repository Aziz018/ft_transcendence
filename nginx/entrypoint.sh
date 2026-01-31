#!/bin/sh

# Create ssl directory
mkdir -p /etc/nginx/ssl

# Generate self-signed certificate if it doesn't exist
if [ ! -f /etc/nginx/ssl/nginx.crt ]; then
    echo "Generating self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/nginx.key \
        -out /etc/nginx/ssl/nginx.crt \
        -subj "/C=FR/ST=Paris/L=Paris/O=42/OU=Transcendence/CN=pongrush.game"
fi

# Execute the CMD
exec "$@"
