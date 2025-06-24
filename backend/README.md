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
cp .env.example .env
```

3. Démarrer les conteneurs PostgreSQL et pgAdmin :

```bash
docker-compose up -d
```

4. Générer et appliquer les migrations :

```bash
bun run generate  # Génère les fichiers de migration
bun run migrate   # Applique les migrations à la base de données
```

5. Démarrer le serveur de développement :

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

- Générer de nouvelles migrations après modification des schémas :

```bash
bun run generate
```

- Appliquer les migrations à la base de données :

```bash
bun run migrate
```

- Visualiser la base de données avec Drizzle Studio :

```bash
bun run studio
```

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
├── migrations/         # Fichiers de migration de base de données
├── src/
│   ├── controllers/    # Gestionnaires de requêtes
│   ├── middlewares/    # Fonctions middleware personnalisées
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes API
│   ├── schemas/        # Définitions des schémas de base de données
│   ├── services/       # Logique métier
│   ├── utils/          # Fonctions utilitaires
│   └── index.ts        # Point d'entrée de l'application
├── .env                # Variables d'environnement
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

### Ajouter une nouvelle fonctionnalité

1. Créez ou modifiez les schémas dans `src/schemas/`
2. Générez les migrations : `bun run generate`
3. Créez les contrôleurs dans `src/controllers/`
4. Créez les routes dans `src/routes/`
5. Mettez à jour la documentation OpenAPI dans `src/routes/index.ts`
6. Testez votre fonctionnalité : `bun run test`
7. Formatez le code : `bun run format`
8. Appliquez les migrations : `bun run migrate`

### Résoudre les problèmes courants

- **Problèmes de base de données** : Vérifiez que les conteneurs Docker sont en cours d'exécution avec `docker ps`
- **Erreurs de migration** : Vérifiez les schémas et assurez-vous que les types correspondent à PostgreSQL
- **Problèmes d'authentification** : Vérifiez que le jeton JWT est correctement inclus dans les en-têtes