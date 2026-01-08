FROM docker.elastic.co/elasticsearch/elasticsearch:9.0.8

USER root

WORKDIR /usr/share/elasticsearch

COPY conf/ ./config/

COPY scripts/ ./scripts/

ENTRYPOINT [ "bash", "scripts/init.sh" ]