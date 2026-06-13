package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/razorpay/razorpay-go"
)


func (app *application) createBooking(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost{
		http.Error(w,"Method not allowed",http.StatusMethodNotAllowed)
		return
	}

	userId := r.Context().Value(userContextKey).(int)

	var input struct{
		VenueId int `json:"venue_id"`
		BookingType string `json:"booking_type"`
		FromDate time.Time `json:"from_date"`
		ToDate time.Time `json:"to_date"`
		StartingTime time.Time `json:"start_time"`
		EndingTime time.Time `json:"end_time"`
		TotalGuests int `json:"total_guests"`
		PurposeOfEvent string `json:"purpose_of_event"`
		BookingStatus string `json:"booking_status"`
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&input)
	if err != nil {
		http.Error(w, "Invalid Json",http.StatusBadRequest)
		return
	}

	if input.BookingType != "day" && input.BookingType != "hour" {
		http.Error(w,"Invalid booking type",400)
		return
	}

	if input.BookingType == "day" &&
		input.ToDate.Before(input.FromDate) {

		http.Error(w,"Invalid date range",400)
		return
	}

	if input.BookingType == "hour" &&
		input.EndingTime.Before(input.StartingTime) {

		http.Error(w,"Invalid time range",400)
		return
	}

	var key string

	if input.BookingType == "day" {
		key = fmt.Sprintf("lock:venue:%d:%s:%s",input.VenueId,input.FromDate.Format("2006-01-02"),input.ToDate.Format("2006-01-02"))
	} else if input.BookingType == "hour" {
		key = fmt.Sprintf("lock:venue:%d:%s:%s:%s",input.VenueId,input.FromDate.Format("2006-01-02"),input.StartingTime.Format("15:04"),input.EndingTime.Format("15:04"))
	}

	ctx := r.Context()

	success, err := app.regCache.Redis.SetNX(ctx,key,"locked",10*time.Second).Result()
	
	if err != nil {
		http.Error(w,err.Error(),http.StatusInternalServerError)
		return
	}

	if !success {
		http.Error(w,"Venue booking already processing",http.StatusConflict,)
		return
	}

	defer app.regCache.Redis.Del(ctx, key)

	var existingBooking *sql.Row

	if input.BookingType == "day" {
		stmt := `
		SELECT id FROM bookings
		WHERE venue_id=$1
		AND ( status='confirmed' OR ( status='pending' AND expires_at > NOW() ) )
		AND (
			from_date <= $3
			AND to_date >= $2
		)`

		existingBooking = app.bookings.DB.QueryRow(stmt,input.VenueId,input.FromDate,input.ToDate)

	} else if input.BookingType == "hour" {
		stmt := `
		SELECT id FROM bookings
		WHERE venue_id=$1
		AND ( status='confirmed' OR ( status='pending' AND expires_at > NOW() ) )
		AND from_date=$2
		AND (
			starting_time < $4
			AND ending_time > $3
		)`

		existingBooking = app.bookings.DB.QueryRow(stmt,input.VenueId,input.FromDate,input.StartingTime,input.EndingTime)
	}

	var id int

	err = existingBooking.Scan(&id)

	if err == nil {
	http.Error(w,"Already booked",400)
	return
	}

	if err != sql.ErrNoRows {
		http.Error(w,"Server error",500)
		return
	}

	var pricePerHour int64
	var pricePerDay int64

	err = app.bookings.DB.QueryRow(`
	SELECT 
		price_per_hour,
		price_per_day
	FROM venues
	WHERE id = $1
	`,input.VenueId).Scan(&pricePerHour,&pricePerDay)

	if err != nil {
		http.Error(w, "Venue not found", http.StatusNotFound)
		return
	}

	var totalAmount int64

	if input.BookingType == "day" {
		days := int64(input.ToDate.Sub(input.FromDate).Hours()/24) + 1
		totalAmount = days * pricePerDay
	}

	if input.BookingType == "hour" {
		duration := input.EndingTime.Sub(input.StartingTime)
		hours := int64(math.Ceil(duration.Hours()))
		totalAmount = hours * pricePerHour
	}

	amountInPaisa := totalAmount * 100

	err = godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	client := razorpay.NewClient(os.Getenv("RAZORPAY_KEY"),os.Getenv("RAZORPAY_KEY_SECRET"))

	data := map[string]interface{}{
		"amount":amountInPaisa,
		"currency":"INR",
		"receipt":"receipt_order_12345",
		"payment_capture":1,
	}

	order, err := client.Order.Create(data, nil)
    if err != nil {
        http.Error(w, "Payment gateway initialization failed", http.StatusInternalServerError)
        return
    }

    razorpayOrderID := order["id"].(string)

	bookingId,err := app.bookings.Insert(input.VenueId,userId,input.TotalGuests,input.FromDate,input.ToDate,input.StartingTime,input.EndingTime,input.BookingType,input.PurposeOfEvent,totalAmount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]any{
		"message":"Venue Booked Succesfully",
		"id":bookingId,
		"razorpay_order_id":razorpayOrderID,
		"amount":strconv.Itoa(int(amountInPaisa)),
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}


func (app *application) getBookings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w,"Method not allowed",http.StatusMethodNotAllowed)
		return
	}

	userId := r.Context().Value(userContextKey).(int)

	type Booking struct {
		ID int `json:"id"`
		VenueId int `json:"venue_id"`
		FromDate time.Time `json:"from_date"`
		ToDate time.Time `json:"to_date"`
		TotalGuests int `json:"no_of_guests"`
		PurposeOfEvent string `json:"purpose_of_event"`
		BookingType string `json:"booking_type"`
		StartingTime time.Time `json:"starting_time"`
		EndingTime time.Time `json:"ending_time"`
		BookingStatus string `json:"booking_status"`
		CreatedAt time.Time `json:"created_at"`
	}

	stmt := `
	SELECT
	id,
	venue_id,
	from_date,
	to_date,
	no_of_guests,
	purpose_of_event,
	booking_type,
	starting_time,
	ending_time,
	status,
	created_at
	FROM bookings 
	WHERE user_id = $1
	`

	rows, err := app.bookings.DB.Query(stmt,userId)
	if err != nil{
		http.Error(w,err.Error(),http.StatusNotFound)
		return
	}

	defer rows.Close()

	bookings := []Booking{}
	for rows.Next() {
		var booking Booking

		err := rows.Scan(
			&booking.ID,
			&booking.VenueId,
			&booking.FromDate,
			&booking.ToDate,
			&booking.TotalGuests,
			&booking.PurposeOfEvent,
			&booking.BookingType,
			&booking.StartingTime,
			&booking.EndingTime,
			&booking.BookingStatus,
			&booking.CreatedAt,
		)

		if err != nil {
			http.Error(w,err.Error(),http.StatusInternalServerError)
			return
		}

		bookings = append(bookings, booking)
	}

	if err = rows.Err(); err != nil {
		http.Error(w,err.Error(),http.StatusInternalServerError)
		return
	}

	response := map[string]any{
		"message": "Bookings Fetched successfully",
		"bookings":bookings,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type VerificationPayload struct {
	RazorpayOrderID   string `json:"razorpay_order_id"`
	RazorpayPaymentID string `json:"razorpay_payment_id"`
	RazorpaySignature string `json:"razorpay_signature"`
	BookingId int `json:"booking_id"`
}

func (app *application) verifyPayment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost{
		http.Error(w,"Method not allowed",http.StatusMethodNotAllowed)
		return
	}

	var input VerificationPayload

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&input)
	if err != nil {
		http.Error(w, "Invalid Json",http.StatusBadRequest)
		return
	}

	err = godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	secret := os.Getenv("RAZORPAY_KEY_SECRET")

	data := input.RazorpayOrderID + "|" + input.RazorpayPaymentID

	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	signatureIsValid := subtle.ConstantTimeCompare([]byte(expectedSignature), []byte(input.RazorpaySignature)) == 1

	if !signatureIsValid {
		http.Error(w, "Invalid transaction signature. Fraud detected.", http.StatusBadRequest)
		return
	}

	stmt := `
		UPDATE bookings 
		SET status = 'confirmed' 
		WHERE id = $1 AND status='pending' AND expires_at > NOW()
	`
	_, err = app.bookings.DB.ExecContext(r.Context(), stmt, input.BookingId)

	if err != nil {
		http.Error(w,err.Error(),http.StatusInternalServerError)
		return
	}

	response := map[string]any{
		"message": "Booking finalized safely",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}