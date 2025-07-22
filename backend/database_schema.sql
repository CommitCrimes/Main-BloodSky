-- Database schema for BloodSky backend

-- Drop existing tables if they exist
DROP TABLE IF EXISTS delivery_participation CASCADE;
DROP TABLE IF EXISTS user_support_relationship_center CASCADE;
DROP TABLE IF EXISTS user_dronist CASCADE;
DROP TABLE IF EXISTS user_hospital CASCADE;
DROP TABLE IF EXISTS user_donation_center CASCADE;
DROP TABLE IF EXISTS blood CASCADE;
DROP TABLE IF EXISTS delivery CASCADE;
DROP TABLE IF EXISTS drone CASCADE;
DROP TABLE IF EXISTS hospital CASCADE;
DROP TABLE IF EXISTS donationcenter CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- User table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    user_name VARCHAR,
    user_firstname VARCHAR,
    dte_create TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tel_number INTEGER,
    user_status TEXT,
    temp_password_token VARCHAR,
    temp_password_expires TIMESTAMP,
    url_used BOOLEAN DEFAULT FALSE,
    reset_password_token VARCHAR,
    reset_password_expires TIMESTAMP
);

-- Donation Center table
CREATE TABLE donationcenter (
    center_id INTEGER PRIMARY KEY,
    center_city VARCHAR,
    center_postal INTEGER,
    center_adress VARCHAR,
    center_latitude DECIMAL(10,8),
    center_longitude DECIMAL(11,8)
);

-- Hospital table
CREATE TABLE hospital (
    hospital_id INTEGER PRIMARY KEY,
    hospital_name VARCHAR,
    hospital_city VARCHAR,
    hospital_postal INTEGER,
    hospital_adress VARCHAR,
    hospital_latitude DECIMAL(10,8),
    hospital_longitude DECIMAL(11,8)
);

-- Drone table
CREATE TABLE drone (
    drone_id INTEGER PRIMARY KEY,
    drone_name VARCHAR,
    center_id INTEGER REFERENCES donationcenter(center_id),
    drone_status TEXT,
    drone_current_lat DECIMAL(10,8),
    drone_current_long DECIMAL(11,8),
    drone_battery TEXT,
    drone_image VARCHAR,
    drone_api_url VARCHAR,
    drone_api_id INTEGER,
    altitude_m DECIMAL(8,2),
    horizontal_speed_m_s DECIMAL(6,2),
    vertical_speed_m_s DECIMAL(6,2),
    heading_deg DECIMAL(5,2),
    flight_mode VARCHAR(50),
    is_armed BOOLEAN DEFAULT false,
    mission_status VARCHAR(50),
    current_mission_id INTEGER,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery table
CREATE TABLE delivery (
    delivery_id INTEGER PRIMARY KEY,
    drone_id INTEGER REFERENCES drone(drone_id),
    blood_id INTEGER,
    hospital_id INTEGER REFERENCES hospital(hospital_id),
    center_id INTEGER REFERENCES donationcenter(center_id),
    dte_delivery TIMESTAMP,
    dte_validation TIMESTAMP,
    delivery_status TEXT,
    delivery_urgent BOOLEAN
);

-- Blood table
CREATE TABLE blood (
    blood_id INTEGER PRIMARY KEY,
    blood_type VARCHAR,
    delivery_id INTEGER REFERENCES delivery(delivery_id)
);

-- User role tables
CREATE TABLE user_donation_center (
    user_id INTEGER REFERENCES users(user_id),
    center_id INTEGER REFERENCES donationcenter(center_id),
    admin BOOLEAN,
    info VARCHAR,
    PRIMARY KEY (user_id)
);

CREATE TABLE user_hospital (
    user_id INTEGER REFERENCES users(user_id),
    hospital_id INTEGER REFERENCES hospital(hospital_id),
    admin BOOLEAN,
    info VARCHAR,
    PRIMARY KEY (user_id)
);

CREATE TABLE user_dronist (
    user_id INTEGER REFERENCES users(user_id),
    info VARCHAR,
    PRIMARY KEY (user_id)
);

CREATE TABLE user_support_relationship_center (
    user_id INTEGER REFERENCES users(user_id),
    info VARCHAR,
    PRIMARY KEY (user_id)
);

-- Delivery participation junction table
CREATE TABLE delivery_participation (
    delivery_id INTEGER REFERENCES delivery(delivery_id),
    user_id INTEGER REFERENCES users(user_id),
    PRIMARY KEY (delivery_id, user_id)
);