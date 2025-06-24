# BloodSky Backend

API Backend pour le système de livraison de sang par drone BloodSky.

## Technologies

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Hono](https://hono.dev/)
- **Base de données**: PostgreSQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Documentation API**: Swagger UI
- **Authentification**: JWT

## Démarrage

### Prérequis

- [Bun](https://bun.sh/) (>=1.0.0)
- [Docker](https://www.docker.com/) et Docker Compose

### Première installation après un clone

1. Installer les dépendances :

```bash
bun install
```

2. Configurer l'environnement :

```bash
# Copier le fichier d'exemple et créer votre fichier .env
cp .env.example .env
```

Modifier le fichier `.env` selon vos besoins (notamment le mot de passe de la base de données).

3. Démarrer les conteneurs PostgreSQL et pgAdmin :

```bash
docker-compose up -d
```

4. Créer les tables dans la base de données :

```bash
# Attendre quelques secondes que PostgreSQL démarre, puis exécuter :
PGPASSWORD=blood_sky_drone psql -h localhost -p 5437 -U postgres -d blood_sky -f database_schema.sql

# Ou avec Docker :
docker exec -i bloodsky_postgres psql -U postgres -d blood_sky < database_schema.sql
```

5. Créer un utilisateur admin :

```bash
bun run create-admin
```

6. Démarrer le serveur de développement :

```bash
bun run dev
```

L'API sera disponible à l'adresse http://localhost:3000 et la documentation Swagger à l'adresse http://localhost:3000/api/swagger.

### Commandes quotidiennes

#### Développement

- Démarrer le serveur de développement avec rechargement à chaud :

```bash
bun run dev
```

#### Base de données

- Visualiser la base de données avec Drizzle Studio :

```bash
bun run studio
```

Puis ouvrir https://local.drizzle.studio dans votre navigateur.

**Note importante** : Le système de migration a été supprimé. Pour modifier la structure de la base de données, modifiez directement le fichier `database_schema.sql` et réexécutez-le.

#### Tests et qualité de code

- Exécuter les tests :

```bash
bun run test
```

- Linter le code :

```bash
bun run lint
```

- Formater le code :

```bash
bun run format
```

#### Production

- Construire l'application pour la production :

```bash
bun run build
```

- Démarrer le serveur de production :

```bash
bun run start
```

## Structure du projet

```
backend/
├── src/
│   ├── controllers/    # Gestionnaires de requêtes
│   ├── middlewares/    # Fonctions middleware personnalisées
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes API
│   ├── schemas/        # Définitions des schémas de base de données
│   ├── services/       # Logique métier
│   ├── utils/          # Fonctions utilitaires
│   └── index.ts        # Point d'entrée de l'application
├── scripts/            # Scripts utilitaires (create-admin, etc.)
├── .env                # Variables d'environnement
├── database_schema.sql # Schéma de la base de données
├── docker-compose.yml  # Configuration Docker
├── drizzle.config.ts   # Configuration Drizzle ORM
└── package.json        # Dépendances et scripts du projet
```

## Documentation API

La documentation de l'API est disponible à l'adresse `/api/swagger` lorsque l'application est en cours d'exécution.

## Authentification

L'API utilise des jetons JWT pour l'authentification. Pour accéder aux endpoints protégés :

1. Inscrivez un nouvel utilisateur ou connectez-vous avec des identifiants existants
2. Incluez le jeton JWT dans l'en-tête Authorization de vos requêtes :

```
Authorization: Bearer VOTRE_JETON_JWT
```

## Workflow de développement

### Gestion de la base de données

**Important** : Le système de migration a été supprimé. La structure de la base de données est maintenant gérée via le fichier `database_schema.sql`.

#### Modifier la structure de la base de données

1. Modifiez les schémas dans `src/schemas/`
2. Mettez à jour le fichier `database_schema.sql` pour refléter les changements
3. Réexécutez le fichier SQL :
   ```bash
   PGPASSWORD=blood_sky_drone psql -h localhost -p 5437 -U postgres -d blood_sky -f database_schema.sql
   ```
4. Vérifiez les changements avec Drizzle Studio : `bun run studio`

### Ajouter une nouvelle fonctionnalité

1. Créez ou modifiez les schémas dans `src/schemas/`
2. Mettez à jour `database_schema.sql` si nécessaire
3. Créez les contrôleurs dans `src/controllers/`
4. Créez les routes dans `src/routes/`
5. Mettez à jour la documentation OpenAPI dans `src/routes/index.ts`
6. Testez votre fonctionnalité : `bun run test`
7. Formatez le code : `bun run format`

### Résoudre les problèmes courants

- **Problèmes de base de données** : Vérifiez que les conteneurs Docker sont en cours d'exécution avec `docker ps`
- **Table non trouvée** : Réexécutez le fichier `database_schema.sql`
- **Problèmes d'authentification** : Vérifiez que le jeton JWT est correctement inclus dans les en-têtes
- **Erreurs de configuration** : Vérifiez que le fichier `.env` contient toutes les variables nécessaires

### Notes importantes sur les changements récents

- Le système de migration Drizzle a été supprimé
- Tous les IDs sont maintenant en INTEGER au lieu de VARCHAR
- Les noms de tables sont en minuscule
- La table des utilisateurs s'appelle maintenant `users` (et non `user`)