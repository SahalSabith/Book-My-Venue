package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"github.com/lib/pq"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/joho/godotenv"
)

func (app *application) createVenue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	ownerId := r.Context().Value(userContextKey).(int)
	role := r.Context().Value(roleContextKey).(string)

	if role != "owner" {
		http.Error(w, "User dont have access", http.StatusUnauthorized)
		return
	}


	var input struct {
		Name string `json:"name"`

		Description string `json:"description"`
		District string `json:"district"`
		State string `json:"state"`
		City string `json:"city"`
		AddressLine string `json:"address_line"`

		MaxCapacity int64 `json:"max_capacity"`
		PricePerHour int64 `json:"price_per_hour"`
		PricePerDay int64 `json:"price_per_day"`
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&input)

	validator := NewValidator()

	if strings.TrimSpace(input.Name) =="" {
		validator.AddError("Name","Name is required")
	}
	if input.MaxCapacity == 0 {
		validator.AddError("MaxCapacity","MaxCapacity is required")
	}

	if err != nil {
		http.Error(w, err.Error() , http.StatusBadRequest)
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

	venueId,err := app.venues.Insert(ownerId,input.MaxCapacity,input.PricePerHour,input.PricePerDay,input.Name,input.Description,input.District,input.State,input.City,input.AddressLine)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]any{
		"message":"Venue Created Succesfully",
		"id":venueId,
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
	
}

func (app *application) getVenuesByUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	ownerId := r.Context().Value(userContextKey).(int)
	role := r.Context().Value(roleContextKey).(string)

	if role != "owner" {
		http.Error(w, "User dont have access", http.StatusUnauthorized)
		return
	}

	venues, err := app.venues.GetUserVenues(ownerId)
	if err != nil {
		http.Error(w, err.Error(),http.StatusInternalServerError)
		return
	}

	response := map[string]any{
		"venues":venues,
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (app *application) getVenue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	venueID, err := strconv.Atoi(r.PathValue("id"))
	ownerId := r.Context().Value(userContextKey).(int)

	if err != nil {
		http.Error(w, "invalid venue ID", http.StatusBadRequest)
		return
	}

	venue, err := app.venues.GetById(venueID)
	if err != nil {
		http.Error(w, "Failed to fetch venue",http.StatusBadRequest)
		return
	}

	if venue.OwnerID != ownerId {
		http.Error(w, "dont have access to this data",http.StatusUnauthorized)
		return
	}

	response := map[string]any{
		"venues":venue,
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (app *application) updateVenue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	ownerId := r.Context().Value(userContextKey).(int)
	role := r.Context().Value(roleContextKey).(string)

	if role != "owner" {
		http.Error(w, "User dont have access", http.StatusUnauthorized)
		return
	}

	venueID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid venue ID", http.StatusBadRequest)
		return
	}

	venue, err := app.venues.GetById(venueID)

	if err != nil {
		http.Error(w, "Venue not found",http.StatusNotFound)
		return
	}

	if venue.OwnerID != ownerId {
		http.Error(w, "User dont have access", http.StatusUnauthorized)
		return
	}

	var fields map[string]any

	err = json.NewDecoder(r.Body).Decode(&fields)
	if err != nil {
		http.Error(w,"invalid request body" , http.StatusBadRequest)
		return
	}

	if len(fields) == 0 {
		http.Error(w,"No Fields provided" , http.StatusBadRequest)
		return
	}

	err = app.venues.UpdateField(venueID,fields)
	if err != nil {
		http.Error(w,err.Error(),http.StatusBadRequest)
		return
	}

	response := map[string]string{
		"message": "venue updated successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


func (app *application) deleteVenue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	ownerId := r.Context().Value(userContextKey).(int)
	role := r.Context().Value(roleContextKey).(string)

	if role != "owner" {
		http.Error(w, "User dont have access", http.StatusUnauthorized)
		return
	}
	
	venueID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid venue ID", http.StatusBadRequest)
		return
	}

	venue, err := app.venues.GetById(venueID)

	if err != nil {
		http.Error(w, "Venue not found",http.StatusNotFound)
		return
	}

	if venue.OwnerID != ownerId {
		http.Error(w, "User dont have access", http.StatusUnauthorized)
		return
	}

	stmt := `
		UPDATE venues 
		SET deleted_at = NOW()
		WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL
	`

	result, err := app.venues.DB.ExecContext(r.Context(), stmt, venueID, ownerId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		http.Error(w,err.Error(),http.StatusNotFound)
		return
	}

	response := map[string]string{
		"message": "Venue deleted successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


func (app *application) listVenus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	type Venue struct {
		ID int `json:"id"`
		Name string `json:"name"`
		Description string `json:"description"`
		District string `json:"district"`
		PricePerHour int64 `json:"price_per_hour"`
		MaxCapacity int64 `json:"max_capacity"`
		Images []string `json:"images"`
	}

	stmt := `
		SELECT 
		id,
		name,
		description,
		district,
		price_per_hour,
		max_capacity,
		images
	FROM venues 
	WHERE deleted_at IS NULL
	`

	rows, err := app.venues.DB.Query(stmt)
	if err != nil {
		http.Error(w, err.Error(),http.StatusNotFound)
		return
	}

	defer rows.Close()

	venues := []Venue{}
	
	for rows.Next() {
		var venue Venue

		err := rows.Scan(
			&venue.ID,
			&venue.Name,
			&venue.Description,
			&venue.District,
			&venue.PricePerHour,
			&venue.MaxCapacity,
			pq.Array(&venue.Images),
		)

		if err != nil {
			http.Error(w,err.Error(),http.StatusInternalServerError)
			return
		}

		venues = append(venues, venue)
	}

	if err = rows.Err(); err != nil {
		http.Error(w,err.Error(),http.StatusInternalServerError)
		return
	}

	response := map[string]any{
		"message": "Venues fetched Successfully",
		"venues":venues,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


func (app *application) getVeneDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	venueID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid venue ID", http.StatusBadRequest)
		return
	}

	type Venue struct {
		ID int `json:"id"`
		Name string `json:"name"`
		Description string `json:"description"`
		District string `json:"district"`
		State string `json:"state"`
		City string `json:"city"`
		AddressLine string `json:"address_line"`
		PricePerDay int64 `json:"price_per_day"`
		PricePerHour int64 `json:"price_per_hour"`
		MaxCapacity int64 `json:"max_capacity"`
		Images []string `json:"images"`
	}

	stmt := `
	SELECT 
		id,
		name,
		description,
		district,
		state,
		city,
		address_line,
		price_per_day,
		price_per_hour,
		max_capacity,
		images
	FROM venues WHERE id = $1 AND deleted_at IS NULL
	`

	var venue Venue

	err = app.venues.DB.QueryRow(stmt,venueID).Scan(
		&venue.ID,
		&venue.Name,
		&venue.Description,
		&venue.District,
		&venue.State,
		&venue.City,
		&venue.AddressLine,
		&venue.PricePerDay,
		&venue.PricePerHour,
		&venue.MaxCapacity,
		pq.Array(&venue.Images),
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w,"User not found",http.StatusNotFound)
			return
		}
		http.Error(w,err.Error(),http.StatusInternalServerError)
		return
	}

	response := map[string]any{
		"venue":venue,
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

type UploadResponse struct {
	Message string `json:"message"`
	URLs []string `json:"urls"`
}

func (app *application) venueImageUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	ownerId := r.Context().Value(userContextKey).(int)
	role := r.Context().Value(roleContextKey).(string)

	if role != "owner" {
		http.Error(w, "User dont have access", http.StatusUnauthorized)
		return
	}
	err := r.ParseMultipartForm(20 << 20)
	if err != nil {
		http.Error(w, "Files too large. Max total 20MP",http.StatusBadRequest)
		return
	}

	venueID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w,"Invalid venue ID",http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["venue_images"]
	if len(files) == 0 {
		http.Error(w, "No images provided", http.StatusBadRequest)
		return
	}

	err = godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	cloud_name := os.Getenv("CLOUDINARY_NAME")
	api_key := os.Getenv("CLOUDINARY_API_KEY")
	api_secret := os.Getenv("CLOUDINARY_API_SECRET")

	cld, err := cloudinary.NewFromParams(cloud_name, api_key, api_secret)
	if err != nil {
		http.Error(w, "Storage config error", http.StatusInternalServerError)
		return
	}

	var uploadedURLs []string

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			continue // Skip corrupted individual files instead of crashing the whole request
		}
		
		ctx := context.Background()
		uploadResult, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
			Folder: "bookmyvenue/venues",
		})
		file.Close()
		if err != nil {
			continue // If one image upload fails to Cloudinary, keep processing the next ones
		}

		// 4. Append this specific URL directly into the PostgreSQL array column
		stmt := `
			UPDATE venues 
			SET images = array_append(images, $1) 
			WHERE id = $2 AND owner_id = $3 AND deleted_at IS NULL
		`
		_, err = app.venues.DB.ExecContext(r.Context(), stmt, uploadResult.SecureURL, venueID, ownerId)
		if err == nil {
			uploadedURLs = append(uploadedURLs, uploadResult.SecureURL)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(UploadResponse{
		Message: "Processing complete",
		URLs:    uploadedURLs,
	})
}