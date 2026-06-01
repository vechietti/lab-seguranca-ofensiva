# Utiliza uma imagem base de Golang intencionalmente desatualizada e vulneravel
FROM golang:1.15-alpine

WORKDIR /app

COPY go.mod ./

# Baixa as dependencias
RUN go mod download

COPY . .

RUN go build -o main .

EXPOSE 8080

CMD ["./main"]
