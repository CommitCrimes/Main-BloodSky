import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import dotenv from 'dotenv';
import { testConnection } from './utils/db';
import { applyMigrations } from './utils/migrations';

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application Hono
const app = new Hono();

// Middlewares
app.use(logger());
app.use(cors());

// Routes
app.get('/', (c) => {
  return c.json({
    message: 'API BloodSky en cours d\'exécution',
    version: '1.0.0',
  });
});

// Point de terminaison de vérification d'état
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

// Port du serveur
const port = parseInt(process.env.PORT || '3000');

// Connexion à la base de données et application des migrations
const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await testConnection();
    
    // Appliquer les migrations
    await applyMigrations();
    
    // Démarrer le serveur
    serve({
      fetch: app.fetch,
      port,
    });
    
    console.log(`Serveur démarré sur le port ${port}`);
  } catch (error) {
    console.error('Échec du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();