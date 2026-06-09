package main

import (
	"BookMyVenue/internal/database"
	"BookMyVenue/internal/models"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

type application struct {
	users *models.UserModel
	venueOwners *models.VenueOwnerModel
	jwtSecureKey []byte
	regCache *models.RegistrationCache
	forgotCache *models.ForgotPasswordCache
}

func main() {
	dsn := "postgres://postgres:sahal123@localhost:5432/book_my_venue?sslmode=disable"

	db, err := database.OpenDB(dsn)
	if err != nil {
		log.Fatal("Cannot connect to database:",err)
	}

	defer db.Close()

	log.Println("Database Connection pool established successfully")

	redisClient, err := database.OpenRedis()
	if err != nil {
		log.Fatal("Cannot Connect to redis: ",err)
	}
	defer redisClient.Close()
	log.Println("Redis connection established!")

	err = godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	secretKey := os.Getenv("JWT_SECRET")

	app := &application{
		users: &models.UserModel{DB: db},
		venueOwners: &models.VenueOwnerModel{DB: db},
		jwtSecureKey: []byte(secretKey),
		regCache: &models.RegistrationCache{Redis: redisClient},
		forgotCache: &models.ForgotPasswordCache{Redis: redisClient},
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/health",func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello this api is working....."))
	})

	mux.HandleFunc("/register",app.registerUserHandle)
	mux.HandleFunc("/login",app.loginUserHandle)
	mux.HandleFunc("/verify-otp",app.verifyOtp)
	mux.HandleFunc("/resend-otp",app.resendOtp)
	mux.HandleFunc("/forgot-password",app.forgotPassword)
	mux.HandleFunc("/verify-forgotpassowrd-otp",app.verifyForgotPassOtp)
	mux.HandleFunc("/change-passowrd",app.resetPassword)
	mux.HandleFunc("/google",app.googleAuthHandler)
	mux.HandleFunc("/register-venue-owner",app.requiredAuthentication(app.registerVenueOwner))

	// app.requiredAuthentication

	addr := ":4000"

	log.Println("You server running on port ",addr)
	log.Fatal(http.ListenAndServe(addr,enableCORS(mux)))
}