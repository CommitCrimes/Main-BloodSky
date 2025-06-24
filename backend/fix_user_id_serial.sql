-- Convertir user_id en SERIAL pour l'auto-increment
-- Créer une séquence pour user_id
CREATE SEQUENCE IF NOT EXISTS users_user_id_seq;

-- Définir la valeur actuelle de la séquence (commence après le dernier ID existant)
SELECT setval('users_user_id_seq', COALESCE(MAX(user_id), 0) + 1, false) FROM users;

-- Modifier la colonne pour utiliser la séquence
ALTER TABLE users ALTER COLUMN user_id SET DEFAULT nextval('users_user_id_seq');

-- Associer la séquence à la colonne (pour les outils comme pgAdmin)
ALTER SEQUENCE users_user_id_seq OWNED BY users.user_id;

-- Vérifier la configuration
\d users;