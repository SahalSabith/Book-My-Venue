package models

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"crypto/rand"
	"time"

	"github.com/redis/go-redis/v9"
)

type CachedRegistration struct {
	Name string `json:"name"`
	Email string `json:"email"`
	PhoneNumber int64 `json:"phone_number"`
	PasswordHash string `json:"password_hash"`
	OTP string `json:"otp"`
}

type CachedForgotPassword struct {
	Email string `json:"email"`
	OTP string `json:"otp"`
}

type RegistrationCache struct {
	Redis *redis.Client
}

type ForgotPasswordCache struct {
	Redis *redis.Client
}

func (c *RegistrationCache) Save(ctx context.Context, data CachedRegistration) error {
	bytes, err := json.Marshal(data)
	if err != nil {
		return err
	}


	key := fmt.Sprintf("reg:%s",data.Email)


	err = c.Redis.Set(ctx, key, bytes, 5*time.Minute).Err()
	return err
}

func (c *ForgotPasswordCache)  Save(ctx context.Context, data CachedForgotPassword) error {
	bytes, err := json.Marshal(data)
	if err != nil {
		return err
	}

	key := fmt.Sprintf("forgot:%s",data.Email)

	err = c.Redis.Set(ctx, key, bytes, 5*time.Minute).Err()
	return err
}

func (c *ForgotPasswordCache) GenerateResetToken(ctx context.Context, email string) (string,error) {
	bytes := make([]byte, 24)

	_,err := rand.Read(bytes)
	if err != nil {
		return "",err
	}

	generatedToken := base64.URLEncoding.EncodeToString(bytes)
	resetToken := generatedToken[:32]

	key := fmt.Sprintf("token:%s",resetToken)

	err = c.Redis.Set(ctx, key,email,5*time.Minute).Err()
	return resetToken, err
}

func (c *RegistrationCache) FetchAndVerify(ctx context.Context, email, submitedOTP string) (*CachedRegistration,error) {
	key := fmt.Sprintf("reg:%s",email)

	val, err := c.Redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, fmt.Errorf("verification code expired or invalid")
	} else if err != nil {
		return nil, err
	}

	var data CachedRegistration
	err = json.Unmarshal([]byte(val),&data)
	if err != nil {
		return nil, err
	}

	if data.OTP != submitedOTP {
		return nil, fmt.Errorf("incorrect verification code")
	}

	_ = c.Redis.Del(ctx,key)

	return &data,nil
}

func (c *ForgotPasswordCache) FetchAndVerify(ctx context.Context, email,submitedOtp string) (*CachedForgotPassword,error) {
	key := fmt.Sprintf("forgot:%s",email)

	val, err := c.Redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, fmt.Errorf("verification code expired or invalid")
	} else if err != nil {
		return nil, err
	}

	var data CachedForgotPassword
	err = json.Unmarshal([]byte(val),&data)
	if err != nil {
		return nil, err
	}

	if data.OTP != submitedOtp {
		return nil, fmt.Errorf("incorrect verification code")
	}

	_ = c.Redis.Del(ctx,key)
	return &data, nil
}

func (c *ForgotPasswordCache) FetchResetToken(ctx context.Context,resetToken string) (string,error) {
	key := fmt.Sprintf("token:%s",resetToken)
	
	email, err := c.Redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", fmt.Errorf("reset token expired or invalid")
	} else if err != nil {
		return "",err
	}

	err = c.Redis.Del(ctx,key).Err()
	if err != nil {
		return "",nil
	}
	return email,nil
}