# API Backend BloodSky

API Backend pour le projet BloodSky utilisant Hono, TypeScript et PostgreSQL.

## Prérequis

- Docker et Docker Compose
- Node.js
- npm ou yarn

## Installation et configuration pour les nouveaux développeurs

Pour les nouveaux membres de l'équipe rejoignant le projet, voici la procédure complète d'installation (à faire une seule fois) :

```bash
# 1. Cloner le projet
git clone [URL_DU_REPO]
cd Main-BloodSky

# 2. Installer les dépendances backend (une seule fois)
cd backend
npm install

# 3. Copier le fichier d'environnement (une seule fois)
cp .env.example .env

# 4. Démarrer la base de données
npm run db:start

# 5. Appliquer les migrations initiales
npm run db:migrate

# 6. Démarrer le serveur de développement
npm run dev

# 7. Dans un autre terminal, installer et démarrer le frontend (une seule fois pour l'installation)
cd ../frontend
npm install
npm run dev
```

## Développement quotidien

Une fois le projet configuré, voici le workflow habituel de développement (à chaque session de travail) :

```bash
# 1. Démarrer la base de données (au début de votre session de travail)
cd backend
npm run db:start

# 2. Appliquer les nouvelles migrations (uniquement après un pull qui contient de nouvelles migrations)
npm run db:migrate

# 3. Démarrer le serveur de développement backend
npm run dev

# 4. Dans un autre terminal, démarrer le frontend
cd ../frontend
npm run dev
```

## Informations sur la Base de Données

### Démarrage et arrêt de la base de données

```bash
# Démarrer la base de données
npm run db:start

# Arrêter la base de données
npm run db:stop
```

Cela lancera :
- Base de données PostgreSQL sur le port 5437
- PgAdmin4 sur le port 5050 (accessible à http://localhost:5050)

### Accès à PgAdmin

1. Ouvrir http://localhost:5050
2. Se connecter avec :
   - Email : admin@bloodsky.com
   - Mot de passe : mdp....

3. Ajouter un nouveau serveur :
   - Nom : BloodSky Local
   - Hôte : postgres (ou localhost si connexion en dehors de Docker)
   - Port : 5432 (interne) ou 5437 (externe)
   - Base de données de maintenance : postgres
   - Nom d'utilisateur : postgres
   - Mot de passe : mdp....

### Informations de Connexion à la Base de Données

- Base de données : blood_sky
- Utilisateur : postgres
- Mot de passe : mdp....
- Port : 5437

## Système de Migrations

Le projet utilise un système de migration pour gérer les évolutions du schéma de la base de données.

### Exécuter les migrations

```bash
# Appliquer les migrations non encore exécutées
npm run db:migrate
```

### Création d'une Nouvelle Migration

Pour créer une nouvelle migration, suivez ces étapes :

1. Créez un nouveau fichier dans le dossier `/database/migrations/` avec un nom au format `XXX_description.sql` (où XXX est un numéro séquentiel)
2. Ajoutez votre code SQL dans ce fichier
3. Exécutez `npm run db:migrate` pour appliquer la migration

Exemple de nouvelle migration (`003_add_user_roles.sql`) :

```sql
-- Migration: 003_add_user_roles
-- Description: Ajoute une colonne rôle aux utilisateurs

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Utiliser des blocs DO pour les opérations conditionnelles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_role') THEN
    CREATE INDEX idx_user_role ON "user"(role);
  END IF;
END
$$;
```

### Notes importantes sur les migrations

- La commande `db:start` démarre simplement les conteneurs Docker, elle peut être exécutée plusieurs fois sans problème
- La commande `db:migrate` n'applique que les migrations qui N'ONT PAS ENCORE été exécutées
- Après un `git pull`, pensez à exécuter `npm run db:migrate` si d'autres développeurs ont ajouté des migrations

### Règles pour maintenir l'intégrité des migrations

1. **Ne jamais modifier une migration existante** qui a déjà été commitée ou partagée
   - Si vous trouvez une erreur, créez une nouvelle migration pour la corriger

2. **Toujours rendre les migrations idempotentes**
   - Utilisez `IF NOT EXISTS`, `IF EXISTS`, et des blocs `DO $$`
   - Assurez-vous qu'elle peut être exécutée plusieurs fois sans erreur

3. **Coordonnez avec votre équipe**
   - Prévenez les autres quand vous ajoutez une migration
   - Évitez de créer des migrations avec le même numéro (ex: deux personnes créant "002_...")

4. **Pour les rétractions ou changements majeurs**
   - Créez une migration de "rollback" plutôt que de supprimer une migration existante

## Commandes Utiles pour la Base de Données

### Visualiser les Tables
```bash
# Se connecter à la base de données
docker exec -it blood_sky_db psql -U postgres -d blood_sky

# Lister toutes les tables
\dt

# Examiner la structure d'une table
\d+ "user"
```

### Sauvegarde et Restauration
```bash
# Sauvegarde
docker exec -it blood_sky_db pg_dump -U postgres -d blood_sky > backup.sql

# Restauration
cat backup.sql | docker exec -i blood_sky_db psql -U postgres -d blood_sky
```
