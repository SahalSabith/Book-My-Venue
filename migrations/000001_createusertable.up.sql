CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number BIGINT,
    password_hash TEXT,
    auth_provider TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'user',

    created_at TIMESTAMP DEFAULT NOW()
);