package main

import (
	"unicode"
	"net/smtp"
	"math/big"
	"crypto/rand"
	"context"
	"github.com/joho/godotenv"
	"log"
	"os"
	"fmt"
	"net/http"
	"errors"
	"time"
)

type Validator struct {
	Errors map[string]string
}

func NewValidator() *Validator{
	return &Validator{
		Errors: make(map[string]string),
	}
}

func (v *Validator) AddError(field, message string) {
	v.Errors[field] = message
}

func (v *Validator) Valid() bool {
	return len(v.Errors) == 0
}

func validPassword(password string) bool {
	if len(password) < 8 {
		return false
	}
	hasNumber := false
	hasSpecial := false

	for _, char := range password {
		switch {
		case unicode.IsNumber(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}
	return hasNumber && hasSpecial
}

func GenerateSecureOTP(length int) (string,error) {
	const digits = "0123456789"
	result := make([]byte, length)
	for i := 0; i < length; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		result[i] = digits[num.Int64()]
	}
	return string(result), nil
}

func (app *application) sendOTPEmail(targetEmail, otpCode string) {
	go func() {
		err := godotenv.Load()

		if err != nil {
			log.Fatal("Error loading .env")
		}

		smtpHost := os.Getenv("SMTP_HOST")
		smtpPort := os.Getenv("SMTP_PORT")
		smtpUsername := os.Getenv("SMTP_USERNAME")
		smtpPassword := os.Getenv("SMTP_PASSWORD")

		subject := "Subject: Your Venue Booking Verification Code\r\n"
		mimeHeaders := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\r\n"
		
		body := fmt.Sprintf(`
			<html>
				<body>
					<h2>Verify Your Account</h2>
					<p>Your one-time verification code is: <strong>%s</strong></p>
					<p>This code will expire in exactly 1 minutes.</p>
				</body>
			</html>
		`, otpCode)

		message := []byte(subject + mimeHeaders + "\r\n" + body)

		auth := smtp.PlainAuth("",smtpUsername,smtpPassword,smtpHost)

		address := fmt.Sprintf("%s:%s",smtpHost,smtpPort)
		err = smtp.SendMail(address,auth,smtpUsername,[]string{targetEmail},message)
		if err != nil {
			fmt.Printf("BACKGROUND ERROR: Failed to send OTP to %s: %v\n", targetEmail, err)
			return
		}
		fmt.Printf("BACKGROUND SUCCESS: OTP dispatched to %s\n", targetEmail)
	}()
}





var ErrRateLimitExceeded = errors.New("rate limit exceeded")

func (app *application) enforceRateLimit(ctx context.Context, key string, maxRequest int64, window time.Duration) error {
	count, err := app.regCache.Redis.Incr(ctx, key).Result()
	if err != nil {
		return err
	}

	if count ==1 {
		app.regCache.Redis.Expire(ctx, key, window)
	}

	if count > maxRequest {
		return ErrRateLimitExceeded
	}

	return nil
}

func getIPAddress(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded
	}

	return r.RemoteAddr
}