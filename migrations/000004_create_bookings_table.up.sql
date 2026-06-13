CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'rejected',
    'completed'
);


CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,

    venue_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    from_date DATE NOT NULL,
    to_date DATE NOT NULL,

    no_of_guests INTEGER NOT NULL,

    purpose_of_event VARCHAR(255) NOT NULL,
    booking_type VARCHAR(255) NOT NULL,

    starting_time TIME,
    ending_time TIME,
    total_amount BIGINT NOT NULL DEFAULT 0,

    status booking_status DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,

    FOREIGN KEY (venue_id)
        REFERENCES venues(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);