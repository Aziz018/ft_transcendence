FROM alpine/curl:8.14.1

WORKDIR /setup

COPY scripts/ ./scripts/

COPY dashboards/ ./dashboards/

ENTRYPOINT [ "sh", "scripts/init.sh" ]