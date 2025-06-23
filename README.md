# Projet BloodSky

Une application web moderne avec un frontend React TypeScript et un backend Hono TypeScript.

## Structure du Projet

- `/frontend` - Application React TypeScript avec Vite
- `/backend` - API Hono TypeScript avec PostgreSQL

## Démarrage Rapide

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run db:start   # Démarrer la base de données PostgreSQL
npm run db:migrate # Appliquer les migrations
npm run dev        # Démarrer le serveur de développement
```

## Technologies Utilisées

### Frontend
- React
- TypeScript
- Vite

### Backend
- Hono
- TypeScript
- Node.js
- PostgreSQL

### Base de Données
- PostgreSQL (via Docker)
- Système de migration intégré

## Fonctionnalités Principales

BloodSky est un système de gestion de livraison de sang par drones, permettant:
- Suivi des livraisons de sang entre centres de don et hôpitaux
- Gestion des drones et de leur statut
- Traçabilité des échantillons de sang
- Interface pour différents types d'utilisateurs (personnel hospitalier, opérateurs de drones, etc.)

## Documentation

Pour plus de détails sur le fonctionnement du projet, consultez les fichiers README respectifs dans les dossiers `/frontend` et `/backend`.