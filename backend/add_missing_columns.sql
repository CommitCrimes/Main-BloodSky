-- Ajouter les colonnes manquantes à la table users existante
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password_token VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS url_used BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;

-- Vérifier la structure de la table
\d users;