-- Migration: 001_initial_schema
-- Description: Création initiale du schéma de base de données

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création des tables

-- Table user
CREATE TABLE IF NOT EXISTS "user" (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_firstname VARCHAR(100) NOT NULL,
  dte_create TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tel_number BIGINT,
  user_status TEXT DEFAULT 'active'
);

-- Table donationcenter (centre de don)
CREATE TABLE IF NOT EXISTS donationcenter (
  center_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_city VARCHAR(100) NOT NULL,
  center_postal INTEGER NOT NULL,
  center_adress VARCHAR(255) NOT NULL,
  center_latitude DECIMAL(10, 7) NOT NULL,
  center_longitude DECIMAL(10, 7) NOT NULL
);

-- Table hospital (hôpital)
CREATE TABLE IF NOT EXISTS hospital (
  hospital_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_name VARCHAR(100) NOT NULL,
  hospital_city VARCHAR(100) NOT NULL,
  hospital_postal INTEGER NOT NULL,
  hospital_adress VARCHAR(255) NOT NULL,
  hospital_latitude DECIMAL(10, 7) NOT NULL,
  hospital_longtitude DECIMAL(10, 7) NOT NULL
);

-- Table drone
CREATE TABLE IF NOT EXISTS drone (
  drone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drone_name VARCHAR(100) NOT NULL,
  center_id UUID REFERENCES donationcenter(center_id),
  drone_status TEXT DEFAULT 'available',
  drone_current_lat DECIMAL(10, 7),
  drone_current_long DECIMAL(10, 7),
  drone_battery TEXT,
  drone_image VARCHAR(255)
);

-- Table delivery (livraison) - sans la référence à blood initialement
CREATE TABLE IF NOT EXISTS delivery (
  delivery_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drone_id UUID REFERENCES drone(drone_id),
  hospital_id UUID REFERENCES hospital(hospital_id),
  center_id UUID REFERENCES donationcenter(center_id),
  dte_delivery TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dte_validation TIMESTAMP,
  delivery_status TEXT DEFAULT 'pending',
  delivery_urgent BOOLEAN DEFAULT FALSE
);

-- Table blood (sang)
CREATE TABLE IF NOT EXISTS blood (
  blood_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blood_type VARCHAR(10) NOT NULL,
  delivery_id UUID REFERENCES delivery(delivery_id)
);

-- Ajouter blood_id à delivery après création des deux tables
-- Utilise IF NOT EXISTS pour éviter les erreurs en cas de ré-exécution
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'delivery' AND column_name = 'blood_id'
  ) THEN
    ALTER TABLE delivery ADD COLUMN blood_id UUID REFERENCES blood(blood_id);
  END IF;
END
$$;

-- Table delivery_participation
CREATE TABLE IF NOT EXISTS delivery_participation (
  delivery_id UUID REFERENCES delivery(delivery_id),
  user_id UUID REFERENCES "user"(user_id),
  PRIMARY KEY (delivery_id, user_id)
);

-- Table user_donation_center
CREATE TABLE IF NOT EXISTS user_donation_center (
  user_id UUID REFERENCES "user"(user_id),
  center_id UUID REFERENCES donationcenter(center_id),
  admin BOOLEAN DEFAULT FALSE,
  info VARCHAR(255),
  PRIMARY KEY (user_id, center_id)
);

-- Table user_dronist
CREATE TABLE IF NOT EXISTS user_dronist (
  user_id UUID PRIMARY KEY REFERENCES "user"(user_id),
  info VARCHAR(255)
);

-- Table user_support_relationship_center
CREATE TABLE IF NOT EXISTS user_support_relationship_center (
  user_id UUID PRIMARY KEY REFERENCES "user"(user_id),
  info VARCHAR(255)
);

-- Table user_hospital
CREATE TABLE IF NOT EXISTS user_hospital (
  user_id UUID REFERENCES "user"(user_id),
  hospital_id UUID REFERENCES hospital(hospital_id),
  admin BOOLEAN DEFAULT FALSE,
  info VARCHAR(255),
  PRIMARY KEY (user_id, hospital_id)
);

-- Création d'index pour optimiser les requêtes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_delivery_status') THEN
    CREATE INDEX idx_delivery_status ON delivery(delivery_status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_delivery_urgent') THEN
    CREATE INDEX idx_delivery_urgent ON delivery(delivery_urgent);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_drone_status') THEN
    CREATE INDEX idx_drone_status ON drone(drone_status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_blood_type') THEN
    CREATE INDEX idx_blood_type ON blood(blood_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_status') THEN
    CREATE INDEX idx_user_status ON "user"(user_status);
  END IF;
END
$$;