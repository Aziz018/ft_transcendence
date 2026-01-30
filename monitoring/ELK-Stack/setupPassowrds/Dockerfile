FROM alpine/curl:8.17.0

WORKDIR /setup

COPY scripts/ ./scripts/

ENTRYPOINT [ "sh", "scripts/init.sh" ]