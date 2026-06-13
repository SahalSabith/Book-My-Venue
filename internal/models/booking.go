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
	TotalAmount int64 `json:"total_amount"`
	BookingStatus string `json:"booking_status"`
}

type BookingModel struct{
	DB *sql.DB
}

func (m *BookingModel) Insert(venueId,userId,totalGuests int, fromDate,toDate,startingTime,endingTime time.Time, bookingType,purposeOfEvent string,totalAmount int64,) (int,error) {
	stmt := `
		INSERT INTO bookings (venue_id, user_id, no_of_guests, starting_time, ending_time,from_date,to_date,purpose_of_event,booking_type,expires_at,status,total_amount)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`

	var id int
	expiresAt := time.Now().Add(10 * time.Minute)

	err := m.DB.QueryRow(stmt, venueId, userId, totalGuests, startingTime,endingTime,fromDate,toDate,purposeOfEvent,bookingType,expiresAt,"pending",totalAmount).Scan(&id)
	if err != nil {
		return 0, err
	}

	return id, nil
}


func (m *BookingModel) CleanupExpiredbookings() (int64,error) {
	stmt := `
        UPDATE bookings 
        SET status = 'rejected' 
        WHERE status = 'pending' AND expires_at <= NOW()
    `
    result, err := m.DB.Exec(stmt)
    if err != nil {
        return 0, err
    }
    return result.RowsAffected()
}