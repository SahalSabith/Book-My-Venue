package main

import (
	"BookMyVenue/internal/models"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"cloud.google.com/go/auth/credentials/idtoken"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type GoogleLoginRequest struct {
	IDToken string `json:"id_token"`
}


func (app *application) registerUserHandle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return 
	}

	var input struct {
		Name string `json:"name"`
		Email string `json:"email"`
		PhoneNo int64 `json:"phone_number"`
		Password string `json:"password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&input)

	validator := NewValidator()
	
	if strings.TrimSpace(input.Name) =="" {
		validator.AddError("Name","Name is required")
	}

	if strings.TrimSpace(input.Email) =="" {
		validator.AddError("Email","Email is required")
	} else if !strings.HasSuffix(strings.ToLower(input.Email),"@gmail.com") {
		validator.AddError("Email","Invalid email")
	}

	if input.PhoneNo == 0 {
		validator.AddError("PhoneNo","PhoneNo is required")
	} else if len(strconv.FormatInt(input.PhoneNo, 10)) != 10 {
		validator.AddError("PhoneNo","Phone number must be 10 digits")
	}

	if strings.TrimSpace(input.Password) =="" {
		validator.AddError("Password","Password is required")
	} else if !validPassword(input.Password) {
		validator.AddError("Password","Password must contain at least 8 characters, one number and one special character")
	}

	if strings.TrimSpace(input.ConfirmPassword) =="" {
		validator.AddError("ConfirmPassword","ConfirmPassword is required")
	} else if input.Password != input.ConfirmPassword {
		validator.AddError("ConfirmPassword","Password and ConfirmPassword doesnt match")
	}

	if err != nil {
		http.Error(w, "Bad Request: Invalid Json", http.StatusBadRequest)
		return
	}

	if !validator.Valid() {
		w.Header().Set("Content-Type","application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"error":validator.Errors,
		})
		return
	}

	otp, err := GenerateSecureOTP(5)
	if err != nil {
		http.Error(w,"Failed to generate otp",http.StatusInternalServerError)
		return
	}



	ipAddress := getIPAddress(r)

	const maxRequests = 3
	const window = 5 * time.Minute

	ipKey := "ratelimit:otp:ip" + ipAddress
	err = app.enforceRateLimit(r.Context(), ipKey, maxRequests, window)
	if errors.Is(err, ErrRateLimitExceeded) {
		http.Error(w, "Too many requests from this device. Please wait 5 minutes.", http.StatusTooManyRequests)
		return
	}


	emailKey := "ratelimit:otp:email" + strings.ToLower(input.Email)
	err = app.enforceRateLimit(r.Context(), emailKey, maxRequests, window)
	if errors.Is(err, ErrRateLimitExceeded) {
		http.Error(w, "Too many requests from this email. Please wait 5 minutes.", http.StatusTooManyRequests)
		return
	}



	userEmail, err := app.users.GetByEmail(strings.ToLower(input.Email))
	if err == nil && userEmail != nil {
		http.Error(w, "User with this email already exist",http.StatusBadRequest)
		return
	}

	userPhone, err := app.users.GetByPhoneNo(input.PhoneNo)
	if err == nil && userPhone != nil {
		http.Error(w, "User with this Phone Number already exist",http.StatusBadRequest)
		return
	}


	app.sendOTPEmail(input.Email,otp)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password),12)

	if err != nil {
		http.Error(w,"Cannot encrypt password",http.StatusInternalServerError)
		return
	}

	err = app.regCache.Save(r.Context(),models.CachedRegistration{
		Name:input.Name,
		Email:input.Email,
		PhoneNumber:input.PhoneNo,
		PasswordHash:string(hashedPassword),
		OTP:otp,
	})

	if err != nil {
		http.Error(w, "Internal Server Error",http.StatusInternalServerError)
		return
	}

	response := map[string]any {
		"message":"Otp Sent Successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)


	json.NewEncoder(w).Encode(response)
}



func (app *application) loginUserHandle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Email string `json:"email"`
		Password string `json:"password"`
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&input)

	email := strings.TrimSpace(strings.ToLower(input.Email))
	validator := NewValidator()

	if email == "" {
		validator.AddError("Email","Email is Required")
	}

	if strings.TrimSpace(input.Password) == "" {
		validator.AddError("Password","Password is required")
	}

	if err != nil {
		http.Error(w, "Bad Request: Invlaid Json", http.StatusBadRequest)
		return
	}

	if !validator.Valid() {
		w.Header().Set("Content-Type","application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"error":validator.Errors,
		})
		return
	}

	user, err := app.users.GetByEmail(input.Email)
	if err != nil {
		http.Error(w, "Invalid Credentials", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash.String),[]byte(input.Password))
	if err != nil {
		http.Error(w, "invalid Credentials", http.StatusUnauthorized)
		return
	}

	claims := jwt.MapClaims{
		"sub":user.ID,
		"role":user.Role,
		"exp":time.Now().Add(24 * time.Hour).Unix(),
		"iat":time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(app.jwtSecureKey)
	if err != nil {
		http.Error(w, "Could Not Generate Token", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"token":tokenString,
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}


func (app *application) verifyOtp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Email string `json:"email"`
		OTP string `json:"otp"`
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&input)

	if err != nil {
		http.Error(w, "Invalid json",http.StatusBadRequest)
		return
	}

	data, err := app.regCache.FetchAndVerify(r.Context(),input.Email,input.OTP)

	email := strings.ToLower(strings.TrimSpace(data.Email))

	newId, err := app.users.Insert(data.Name, email, "local", &data.PasswordHash, &data.PhoneNumber)
	if err != nil {
		http.Error(w, "Server Error: "+err.Error(),http.StatusInternalServerError)
		return
	}


	claims := jwt.MapClaims{
		"sub":newId,
		"role":"user",
		"exp":time.Now().Add(24 * time.Hour).Unix(),
		"iat":time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(app.jwtSecureKey)
	if err != nil {
		http.Error(w, "Could Not Generate Token", http.StatusInternalServerError)
		return
	}
	

	response := map[string]any{
		"message": "Account Created successfully",
		"user": map[string]any{
			"id": newId,
			"name": data.Name,
			"email": data.Email,
			"phone_number": data.PhoneNumber,
		},
		"token":tokenString,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)

}

func (app *application) resendOtp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Email string `json:"email"`
	}

	r.Body = http.MaxBytesReader(w,r.Body,1048578)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&input)

	if err != nil {
		http.Error(w, "invalid json",http.StatusBadRequest)
		return
	}



	ipAddress := getIPAddress(r)

	const maxRequests = 3
	const window = 5 * time.Minute

	ipKey := "ratelimit:otp:ip" + ipAddress
	err = app.enforceRateLimit(r.Context(), ipKey, maxRequests, window)
	if errors.Is(err, ErrRateLimitExceeded) {
		http.Error(w, "Too many requests from this device. Please wait 5 minutes.", http.StatusTooManyRequests)
		return
	}


	emailKey := "ratelimit:otp:email" + strings.ToLower(input.Email)
	err = app.enforceRateLimit(r.Context(), emailKey, maxRequests, window)
	if errors.Is(err, ErrRateLimitExceeded) {
		http.Error(w, "Too many requests from this email. Please wait 5 minutes.", http.StatusTooManyRequests)
		return
	}




	otp, err := GenerateSecureOTP(5)
	if err != nil {
		http.Error(w,"Failed to generate otp",http.StatusInternalServerError)
		return
	}

	app.sendOTPEmail(input.Email,otp)

	response := map[string]any {
		"message":"Otp Sent Successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)


	json.NewEncoder(w).Encode(response)
}

func (app *application) forgotPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w,"Method Not Valid",http.StatusMethodNotAllowed)
		return
	}
	
	var input struct {
		Email string `json:"email"`
	}

	r.Body = http.MaxBytesReader(w,r.Body,1048578)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&input)

	email := strings.TrimSpace(strings.ToLower(input.Email))

	validator := NewValidator()

	if strings.TrimSpace(email) == "" {
		validator.AddError("Email","Email is Required")
	}

	if err != nil {
		http.Error(w,"invalid json",http.StatusBadRequest)
		return
	}

	if !validator.Valid() {
		w.Header().Set("Content-Type","application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"error":validator.Errors,
		})
		return
	}

	user, err := app.users.GetByEmail(email)
	if err != nil {
		http.Error(w,"Otp sent to registered Email",http.StatusOK)
		fmt.Println(err)
		return
	}



	ipAddress := getIPAddress(r)

	const maxRequests = 3
	const window = 5 * time.Minute

	ipKey := "ratelimit:otp:ip" + ipAddress
	err = app.enforceRateLimit(r.Context(), ipKey, maxRequests, window)
	if errors.Is(err, ErrRateLimitExceeded) {
		http.Error(w, "Too many requests from this device. Please wait 5 minutes.", http.StatusTooManyRequests)
		return
	}


	emailKey := "ratelimit:otp:email" + strings.ToLower(input.Email)
	err = app.enforceRateLimit(r.Context(), emailKey, maxRequests, window)
	if errors.Is(err, ErrRateLimitExceeded) {
		http.Error(w, "Too many requests from this email. Please wait 5 minutes.", http.StatusTooManyRequests)
		return
	}




	otp, err := GenerateSecureOTP(5)
	if err != nil {
		http.Error(w,"unable to genrate otp",http.StatusInternalServerError)
		return
	}

	err = app.forgotCache.Save(r.Context(),models.CachedForgotPassword{
		Email: user.Email,
		OTP: otp,
	})

	app.sendOTPEmail(user.Email,otp)

	response := map[string]any {
		"message":"Otp Sent Successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)


	json.NewEncoder(w).Encode(response)
}

func (app *application) verifyForgotPassOtp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed",http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Email string `json:"email"`
		OTP string `json:"otp"`
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048578)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&input)

	if err != nil {
		http.Error(w, "invalid json",http.StatusBadRequest)
		return
	}

	data , err := app.forgotCache.FetchAndVerify(r.Context(),input.Email,input.OTP)
	if err != nil {
		http.Error(w, "Expired or invalid Otp",http.StatusUnauthorized)
		return
	}

	resetToken, err := app.forgotCache.GenerateResetToken(r.Context(),data.Email)
	if err != nil {
		http.Error(w, "internal server error",http.StatusInternalServerError)
		return
	}

	response := map[string]any {
		"message":"OTP Verified Successfully",
		"resetToken":resetToken,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)


	json.NewEncoder(w).Encode(response)
}

func (app *application) resetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not allowed",http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		NewPassword string `json:"newPassword"`
		ResetToken string `json:"resetToken"`
	}

	r.Body = http.MaxBytesReader(w,r.Body,1048578)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&input)

	if err != nil {
		http.Error(w,"Invalid json",http.StatusBadRequest)
		return
	}

	email, err := app.forgotCache.FetchResetToken(r.Context(),input.ResetToken)
	if err != nil {
		http.Error(w, "internal server error",http.StatusInternalServerError)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword),12)

	err = app.users.UpdatePassword(string(hashedPassword),email)
	if err != nil {
		http.Error(w, "Error while updating password",http.StatusInternalServerError)
		return
	}

	response := map[string]any {
		"message":"Password changed Successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)


	json.NewEncoder(w).Encode(response)
}


func (app *application) googleAuthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w,"Method Not Allowed",http.StatusMethodNotAllowed)
		return
	}

	var input GoogleLoginRequest
	
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w,"Invalid request payload",http.StatusBadRequest)
		return
	}

	err = godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	googleClientID:= os.Getenv("GOOGLE_CLIENT_ID")

	payload, err := idtoken.Validate(r.Context(), input.IDToken, googleClientID)
	if err != nil {
		fmt.Printf("SECURITY: invalid Google token rejected : %v\n", err)
		http.Error(w,"unauthorized google token",http.StatusUnauthorized)
		return
	}

	rawEmail, ok := payload.Claims["email"].(string)
	email := strings.ToLower(strings.TrimSpace(rawEmail))
	if !ok {
		http.Error(w, "email claim missing from google token", http.StatusBadRequest)
		return
	}

	name, _ := payload.Claims["name"].(string)


	fmt.Printf("SUCCESS: Verified Google user %s (%s)\n", name, email)

	var userId int
	role := "user"

	user, err := app.users.GetByEmail(email)

	if err != nil && err.Error() != "User not Found" {
		http.Error(w,err.Error(),http.StatusInternalServerError)
		return
	}

	if user == nil {
		userId, err = app.users.Insert(name, email, "google", nil, nil)
		if err != nil {
			http.Error(w, "Server Error: "+err.Error(),http.StatusInternalServerError)
			return
		}
	} else {
		userId = user.ID
		role = user.Role
	}


	claims := jwt.MapClaims{
		"sub":userId,
		"role":role,
		"exp":time.Now().Add(24 * time.Hour).Unix(),
		"iat":time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(app.jwtSecureKey)
	if err != nil {
		http.Error(w, "Could Not Generate Token", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"token":tokenString,
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (app *application) registerVenueOwner(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed",http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		BusinessName string `json:"business_name"`
		BusinessEmail string `json:"business_email"`
		BusinessPhone int64 `json:"business_phone"`
		UserID int
		TermsAndCondition bool `json:"terms_and_condition"`
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&input)

	validator := NewValidator()
	
	if strings.TrimSpace(input.BusinessName) =="" {
		validator.AddError("business_Name","Name is required")
	}

	if strings.TrimSpace(input.BusinessEmail) =="" {
		validator.AddError("Email","Email is required")
	} else if !strings.HasSuffix(strings.ToLower(input.BusinessEmail),"@gmail.com") {
		validator.AddError("Email","Invalid email")
	}

	if input.BusinessPhone == 0 {
		validator.AddError("PhoneNo","PhoneNo is required")
	} else if len(strconv.FormatInt(input.BusinessPhone, 10)) != 10 {
		validator.AddError("PhoneNo","Phone number must be 10 digits")
	}

	if !input.TermsAndCondition {
		validator.AddError("terms_and_condition","terms and condition shold be checked")
	}


	if err != nil {
		http.Error(w, "Bad Request: Invalid Json", http.StatusBadRequest)
		fmt.Println(err)
		return
	}

	if !validator.Valid() {
		w.Header().Set("Content-Type","application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"error":validator.Errors,
		})
		return
	}

	userID := r.Context().Value(userContextKey).(int)

	err = app.venueOwners.Insert(input.BusinessName,input.BusinessEmail,userID,input.BusinessPhone,input.TermsAndCondition)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = app.users.UpdateRole(userID)
	if err != nil {
		http.Error(w, "Error while Creating Venue Owner account",http.StatusInternalServerError)
		return
	}

	claims := jwt.MapClaims{
		"sub":userID,
		"role":"owner",
		"exp":time.Now().Add(24 * time.Hour).Unix(),
		"iat":time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(app.jwtSecureKey)
	if err != nil {
		http.Error(w, "Could Not Generate Token", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"message":"Venue Owner Created Succesfully",
		"token":tokenString,
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}