package models

import (
	"database/sql"
	"time"
)

type Booking struct{
	VenueId int `json:"venue_id"`
	UserId int `json:"user_id"`
	BookingType string `json:"booking_type"`
	FromDate time.Time `json:"from_date"`
	ToDate time.Time `json:"to_date"`
	StartingTime time.Time `json:"start_time"`
	EndingTime time.Time `json:"end_time"`
	TotalGuests int `json:"total_guests"`
	PurposeOfEvent string `json:"purpose_of_event"`
}

type BookingModel struct{
	DB *sql.DB
}

func (m *BookingModel) Insert(venueId,userId,totalGuests int, fromDate,toDate,startingTime,endingTime time.Time, bookingType,purposeOfEvent string) (int,error) {
	stmt := `
		INSERT INTO bookings (venue_id, user_id, no_of_guests, starting_time, ending_time,from_date,to_date,purpose_of_event,booking_type,expires_at,status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id
	`

	var id int
	expiresAt := time.Now().Add(10 * time.Minute)

	err := m.DB.QueryRow(stmt, venueId, userId, totalGuests, startingTime,endingTime,fromDate,toDate,purposeOfEvent,bookingType,expiresAt,"pending").Scan(&id)
	if err != nil {
		return 0, err
	}

	return id, nil
}