FROM golang:alpine

WORKDIR /go/src/app
COPY src/ .
RUN go get github.com/rivo/tview

ENTRYPOINT ["tail", "-f"]
#RUN go build -o installer
#CMD ["./installer"]

