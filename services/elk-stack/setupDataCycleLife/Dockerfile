FROM alpine/curl:8.14.1

WORKDIR /setup

COPY scripts/ ./scripts/

COPY indexLifecyclePolicy/ ./indexLifecyclePolicy/

COPY indexTemplate/ ./indexTemplate/

CMD [ "sh", "scripts/init.sh" ]