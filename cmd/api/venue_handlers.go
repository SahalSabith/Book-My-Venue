package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
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
		http.Error(w, "invalid json", http.StatusBadRequest)
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

	err = app.venues.Insert(ownerId,input.MaxCapacity,input.PricePerHour,input.PricePerDay,input.Name,input.Description,input.District,input.State,input.City,input.AddressLine)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]string{
		"message":"Venue Created Succesfully",
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

	idStr := r.PathValue("id")

	venueID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid venue ID", http.StatusBadRequest)
		return
	}

	venue, err := app.venues.GetById(venueID)
	if err != nil {
		http.Error(w, "Failed to fetch venue",http.StatusBadRequest)
		return
	}

	response := map[string]any{
		"venues":venue,
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}