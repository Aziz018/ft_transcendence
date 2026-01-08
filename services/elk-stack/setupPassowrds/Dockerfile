FROM alpine/curl:8.14.1

WORKDIR /setup

COPY scripts/ ./scripts/

ENTRYPOINT [ "sh", "scripts/init.sh" ]