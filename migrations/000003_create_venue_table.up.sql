CREATE TABLE venues (
    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,
    owner_id INT NOT NULL,

    description TEXT,

    district TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address_line TEXT NOT NULL,

    max_capacity INT NOT NULL,

    price_per_hour BIGINT NOT NULL,
    price_per_day BIGINT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    deleted_at TIMESTAMP DEFAULT NULL,
    images TEXT[] DEFAULT '{}'

    CONSTRAINT fk_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);