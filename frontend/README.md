# Frontend BloodSky

Interface utilisateur pour le projet BloodSky, développée avec React, TypeScript et Vite.

## Polices utilisées

Le projet utilise deux polices Google Fonts :

1. **Iceland** - Pour les titres et éléments d'interface principaux
2. **Share Tech** - Pour le texte et les éléments d'interface secondaires

Ces polices sont importées dans `src/index.css` et disponibles via les classes CSS :
- `.iceland-font` pour la police Iceland
- `.share-tech-font` pour la police Share Tech

Vous pouvez également les utiliser directement avec les variables CSS :
- `var(--font-iceland)`
- `var(--font-share-tech)`

## Installation

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev
```

## Commandes Disponibles

```bash
# Démarrage du serveur de développement
npm run dev

# Construction pour la production
npm run build

# Prévisualisation de la version de production
npm run preview

# Vérification du code avec ESLint
npm run lint
```

## Structure du Projet

```
frontend/
├── public/            # Fichiers statiques
├── src/               # Code source
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Composants React réutilisables
│   ├── hooks/         # Hooks React personnalisés
│   ├── pages/         # Composants de pages
│   ├── services/      # Services d'API et utilitaires
│   ├── stores/        # État global
│   ├── types/         # Définitions de types TypeScript
│   ├── App.tsx        # Composant racine
│   └── main.tsx       # Point d'entrée
├── .eslintrc.js       # Configuration ESLint
├── index.html         # Template HTML
├── package.json       # Dépendances et scripts
├── tsconfig.json      # Configuration TypeScript
└── vite.config.ts     # Configuration Vite
```

## Technologies Principales

- **React**: Bibliothèque UI
- **TypeScript**: Typage statique
- **Vite**: Outil de build et serveur de développement
- **React Router**: Gestion du routage
- **Axios**: Client HTTP pour les requêtes API


