package database

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

func OpenRedis() (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
		Password: "",
		DB: 0,
		PoolSize: 100,
	})

	ctx, cancel := context.WithTimeout(context.Background(),3*time.Second)
	defer cancel()

	err := client.Ping(ctx).Err()
	if err != nil {
		return nil, err
	}

	return client, nil
}