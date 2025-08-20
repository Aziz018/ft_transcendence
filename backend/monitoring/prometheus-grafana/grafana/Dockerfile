FROM debian:bookworm

WORKDIR /root

RUN apt update

RUN apt install -y adduser libfontconfig1 musl wget &&\
    wget https://dl.grafana.com/enterprise/release/grafana-enterprise_12.1.0_amd64.deb &&\
    dpkg -i grafana-enterprise_12.1.0_amd64.deb &&\
    rm -f grafana-enterprise_12.1.0_amd64.deb

ENTRYPOINT  ["bash"]

