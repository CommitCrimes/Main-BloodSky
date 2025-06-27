-- La colonne est nommée hospital_longtitude au lieu de longitude, cette ligne fixe la typo
ALTER TABLE hospital RENAME COLUMN hospital_longtitude TO hospital_longitude;