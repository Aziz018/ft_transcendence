FROM golang:bookworm

WORKDIR /code

COPY code .

RUN go mod init prom_example && go mod tidy

CMD [ "go", "run", "server.go" ]
