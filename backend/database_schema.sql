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
    user_id INTEGER PRIMARY KEY,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    user_name VARCHAR,
    user_firstname VARCHAR,
    dte_create TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tel_number INTEGER,
    user_status TEXT
);

-- Donation Center table
CREATE TABLE donationcenter (
    center_id INTEGER PRIMARY KEY,
    center_city VARCHAR,
    center_postal INTEGER,
    center_adress VARCHAR,
    center_latitude INTEGER,
    center_longitude INTEGER
);

-- Hospital table
CREATE TABLE hospital (
    hospital_id INTEGER PRIMARY KEY,
    hospital_name VARCHAR,
    hospital_city VARCHAR,
    hospital_postal INTEGER,
    hospital_adress VARCHAR,
    hospital_latitude INTEGER,
    hospital_longtitude INTEGER
);

-- Drone table
CREATE TABLE drone (
    drone_id INTEGER PRIMARY KEY,
    drone_name VARCHAR,
    center_id INTEGER REFERENCES donationcenter(center_id),
    drone_status TEXT,
    drone_current_lat INTEGER,
    drone_current_long INTEGER,
    drone_battery TEXT,
    drone_image VARCHAR
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