CREATE TABLE venue_owners (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    business_name TEXT NOT NULL,
    business_email TEXT UNIQUE NOT NULL,
    business_phone BIGINT NOT NULL,
    terms_and_condition BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);