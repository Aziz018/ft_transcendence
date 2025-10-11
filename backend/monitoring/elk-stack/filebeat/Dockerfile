FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y curl

RUN curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-9.1.5-linux-x86_64.tar.gz

RUN tar xzvf filebeat-9.1.5-linux-x86_64.tar.gz && mv filebeat-9.1.5-linux-x86_64 filebeat && rm filebeat-9.1.5-linux-x86_64.tar.gz

COPY conf/filebeat.yml /filebeat/filebeat.yml

CMD [ "/filebeat/filebeat", "-e", "-c", "/filebeat/filebeat.yml", "-d", "*" ]