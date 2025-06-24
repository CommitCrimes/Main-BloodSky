# BloodSky Frontend

Interface utilisateur pour le système de livraison de sang par drone BloodSky.

## Technologies

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Langage**: [TypeScript](https://www.typescriptlang.org/)
- **Gestion d'état**: [MobX](https://mobx.js.org/)
- **Routage**: [React Router](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styles**: [Tailwind CSS](https://tailwindcss.com/)

## Polices utilisées

Le projet utilise deux polices Google Fonts :

1. **Iceland** - Pour les titres et éléments d'interface principaux
2. **Share Tech** - Pour le texte et les éléments d'interface secondaires

Ces polices sont importées dans `src/index.css` et disponibles via les classes CSS :
- `.iceland-font` pour la police Iceland
- `.share-tech-font` pour la police Share Tech

## Démarrage

### Prérequis

- [Node.js](https://nodejs.org/) (>=18.0.0) ou [Bun](https://bun.sh/) (>=1.0.0)

### Première installation après un clone

1. Installer les dépendances:

```bash
# Avec npm
npm install

# Avec Bun (recommandé, plus rapide)
bun install
```

2. Démarrer le serveur de développement:

```bash
# Avec npm
npm run dev

# Avec Bun
bun run dev
```

L'application sera disponible à l'adresse http://localhost:5173.

### Commandes quotidiennes

#### Développement

- Démarrer le serveur de développement:

```bash
bun run dev
```

#### Tests et qualité de code

- Linter le code:

```bash
bun run lint
```

- Formater le code:

```bash
bun run format
```

#### Production

- Construire l'application pour la production:

```bash
bun run build
```

- Prévisualiser la version de production:

```bash
bun run preview
```

## Structure du projet

```
frontend/
├── public/             # Fichiers statiques
├── src/
│   ├── api/            # Clients API et interfaces
│   ├── assets/         # Images, polices et autres ressources
│   ├── components/     # Composants réutilisables
│   ├── pages/          # Pages de l'application
│   ├── stores/         # Gestion d'état global
│   ├── App.tsx         # Composant racine
│   └── main.tsx        # Point d'entrée
├── .env                # Variables d'environnement
├── index.html          # Template HTML
├── tailwind.config.js  # Configuration Tailwind CSS
└── vite.config.ts      # Configuration Vite
```

## Communication avec le backend

L'application frontend communique avec le backend via des requêtes API. L'URL de base de l'API est configurée dans le fichier `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

Si le backend est hébergé à une autre adresse, modifiez cette variable en conséquence.

## Authentification

L'authentification est gérée via JWT (JSON Web Tokens). Lorsqu'un utilisateur se connecte ou s'inscrit, un token est stocké dans le localStorage et inclus automatiquement dans les en-têtes des requêtes API.

## Workflow de développement

### Ajouter une nouvelle fonctionnalité

1. Créez les composants nécessaires dans `src/components/`
2. Ajoutez la logique d'état dans `src/stores/` si nécessaire
3. Créez les clients API dans `src/api/` pour communiquer avec le backend
4. Intégrez les composants dans les pages appropriées dans `src/pages/`
5. Mettez à jour les routes dans `src/App.tsx` si nécessaire

### Bonnes pratiques

- Utilisez TypeScript pour bénéficier du typage statique
- Favorisez les composants fonctionnels et les hooks React
- Utilisez MobX pour la gestion d'état global
- Suivez les conventions de nommage du projet
- Utilisez les outils de lint et de formatage avant de committer

