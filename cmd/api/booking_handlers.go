package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
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
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&input)
	if err != nil {
		http.Error(w, "Invalid Json",http.StatusBadRequest)
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
	}

	if !success {
		errors.New("venue booking already processing")
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

	bookingId,err := app.bookings.Insert(input.VenueId,userId,input.TotalGuests,input.FromDate,input.ToDate,input.StartingTime,input.EndingTime,input.BookingType,input.PurposeOfEvent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]any{
		"message":"Venue Booked Succesfully",
		"id":bookingId,
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