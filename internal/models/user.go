package models

import (
	"database/sql"
	"errors"
	"time"
)

type User struct {
	ID int `json:"id"`
	Name string `json:"name"`
	Email string `json:"email"`
	AuthProvider string `jso:"auth_provider"`
	PhoneNo sql.NullInt64 `json:"phone_number"`
	Role string `json:"role"`
	PasswordHash sql.NullString `json:"-"`
	CreatedAt time.Time `json:"created_at"`
}

type VenueOwner struct {
	UserID int `josn:"user_id"`
	BusinessName string `josn:"business_name"`
	BusinessEmail string `josn:"business_email"`
	BusinessPhone int64 `josn:"business_phone"`
	TermsAndCondition bool `josn:"terms_and_condition"`
}

type VenueOwnerModel struct {
	DB *sql.DB
}

type UserModel struct {
	DB *sql.DB
}

type OTPDetails struct {
	Code string
	ExpiresAt time.Time
	Attempts int
}

func (m *UserModel) Insert(name,email,authProvider string,hashedPassword *string, phoneNumber *int64) (int, error) {
	stmt := `
		INSERT INTO users (name, email, auth_provider, phone_number, password_hash)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	var id int

	err := m.DB.QueryRow(stmt, name, email, authProvider, phoneNumber,hashedPassword).Scan(&id)
	if err != nil {
		if err.Error() == `pq: duplicate key value violates unique constraint "users_email_key"` {
			return 0, errors.New("a user with this email already exists")
		}
		return 0, err
	}

	return id, nil
}

func (m *VenueOwnerModel) Insert(businessName, businessEmail string, userId int, businessPhone int64, termsAndCondition bool) error {
	stmt := `
		INSERT INTO venue_owners (business_name, business_email, user_id, business_phone, terms_and_condition)
		VALUES ($1, $2, $3, $4, $5)
	`

	_,err := m.DB.Exec(stmt, businessName, businessEmail, userId, businessPhone ,termsAndCondition)
	if err != nil{
		if err.Error() == `pq: duplicate key value violates unique constraint "venue_owners_business_email_key"` {
			return errors.New("a business with this email already exists")
		}
		return err
	}
	return nil
}

func (m *UserModel) GetByEmail(email string) (*User, error) {
	stmt := `
	SELECT 
		id,
		name,
		email,
		auth_provider,
		phone_number,
		password_hash,
		role,
		created_at
	FROM users WHERE email = $1
	`

	var user User


	err := m.DB.QueryRow(stmt,email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.AuthProvider,
		&user.PhoneNo,
		&user.PasswordHash,
		&user.Role,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("User not Found")
		}
		return nil, err
	}
	return &user, nil
}


func (m *UserModel) GetByPhoneNo(phoneNo int64) (*User, error) {
	stmt := `
	SELECT 
		id,
		name,
		email,
		auth_provider,
		phone_number,
		role,
		password_hash,
		created_at
	FROM users WHERE phone_number = $1
	`

	var user User


	err := m.DB.QueryRow(stmt,phoneNo).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.AuthProvider,
		&user.PhoneNo,
		&user.Role,
		&user.PasswordHash,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("User not Found")
		}
		return nil, err
	}
	return &user, nil
}

func (m *UserModel) UpdatePassword(newPassword,email string) (error) {
	stmt := `
	UPDATE users SET password_hash = $1 WHERE email = $2
	`

	result, err := m.DB.Exec(stmt,newPassword,email)
	if err != nil {
		return err
	}

	rows,err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return errors.New("users not found")
	}

	return nil
}

func (m *UserModel) UpdateRole(userId int) (error) {
	stmt := `
	UPDATE users SET role = 'owner' WHERE id = $1
	`

	result, err := m.DB.Exec(stmt,userId)
	if err != nil {
		return err
	}

	rows,err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return errors.New("users not found")
	}

	return nil
}