FROM alpine:3.22

WORKDIR /setup-dashboards

RUN apk add --no-cache \
	curl \
	jq

COPY scripts/setup-dashbaords.sh /setup-dashboards/scripts/setup-dashbaords.sh

RUN chmod +x /setup-dashboards/scripts/setup-dashbaords.sh

CMD ["/setup-dashboards/scripts/setup-dashbaords.sh"]