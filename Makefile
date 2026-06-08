build:
	@go build -o bin/BookmyVenue ./cmd/api

run: build
	@./bin/BookmyVenue

test:
	@go test -v ./...