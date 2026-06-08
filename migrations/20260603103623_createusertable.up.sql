CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number BIGINT,
    password_hash TEXT,
    auth_provider TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);