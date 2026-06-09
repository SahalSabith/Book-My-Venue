package models

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Venue struct {
	ID int `json:"id"`
	OwnerID int `json:"owner_id"`
	Name string `json:"name"`

	Description string `json:"description"`
	District string `json:"district"`
	State string `json:"state"`
	City string `json:"city"`
	AddressLine string `json:"address_line"`

	MaxCapacity int64 `json:"max_capacity"`
	PricePerHour int64 `json:"price_per_hour"`
	PricePerDay int64 `json:"price_per_day"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type VenueModel struct {
	DB *sql.DB
}

func (m *VenueModel) Insert(ownerId int, maxCapacity,pricePerHour,pricePerDay int64, name,description,district,state,city,addressLine string) error {
	stmt := `
		INSERT INTO venues (owner_id, name, description, state, district, city, address_line, price_per_day, price_per_hour, max_capacity)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_,err := m.DB.Exec(stmt, ownerId, name, description, state, district, city, addressLine, pricePerDay, pricePerHour, maxCapacity)
	if err != nil {
		return err
	}

	return nil
}

func (m *VenueModel) GetById(id int) (*Venue, error) {
	stmt := `
	SELECT 
		id,
		name,
		owner_id,
		description,
		state,
		district,
		city,
		address_line,
		price_per_day,
		price_per_hour,
		max_capacity,
		updated_at,
		created_at
	FROM venues WHERE id = $1
	`

	var venue Venue

	err := m.DB.QueryRow(stmt,id).Scan(
		&venue.ID,
		&venue.Name,
		&venue.OwnerID,
		&venue.Description,
		&venue.State,
		&venue.District,
		&venue.City,
		&venue.AddressLine,
		&venue.PricePerDay,
		&venue.PricePerHour,
		&venue.MaxCapacity,
		&venue.UpdatedAt,
		&venue.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("User not found")
		}
		return  nil,err
	}
	return &venue, nil
}

func (m *VenueModel) GetUserVenues(owner_id int) ([]Venue,error) {
	stmt := `
	SELECT 
		id,
		name,
		owner_id,
		description,
		state,
		district,
		city,
		address_line,
		price_per_day,
		price_per_hour,
		max_capacity,
		updated_at,
		created_at
	FROM venues 
	WHERE owner_id = $1
	`

	rows, err := m.DB.Query(stmt,owner_id)
	if err != nil {
		return nil,err
	}

	defer rows.Close()

	venues := []Venue{}

	for rows.Next() {
		var venue Venue

		err := rows.Scan(
			&venue.ID,
			&venue.Name,
			&venue.OwnerID,
			&venue.Description,
			&venue.State,
			&venue.District,
			&venue.City,
			&venue.AddressLine,
			&venue.PricePerDay,
			&venue.PricePerHour,
			&venue.MaxCapacity,
			&venue.UpdatedAt,
			&venue.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		venues = append(venues, venue)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return venues, nil
}

func (m *VenueModel) UpdateField(id int, fields map[string]any) error {
	allowedFields := map[string]bool{
		"name":true,
		"description":true,
		"state":true,
		"district":true,
		"city":true,
		"address_line":true,
		"price_per_hour":true,
		"price_per_day":true,
		"max_capacity":true,
	}

	setValues := []string{}
	args := []any{}

	i := 1

	for field, value := range fields {

		if !allowedFields[field] {
			return errors.New("invalid field")
		}

		setValues = append(setValues, fmt.Sprintf("%s = $%d",field, i),)

		args = append(args, value)

		i++
	}

	args = append(args, id)

	stmt := fmt.Sprintf(`
		UPDATE venues
		SET %s
		WHERE id = $%d
	`,
	strings.Join(setValues,", "),
	i,
	)

	_, err := m.DB.Exec(stmt,args...)
	return err
}