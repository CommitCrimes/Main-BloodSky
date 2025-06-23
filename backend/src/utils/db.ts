import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST || 
    !process.env.DB_PORT || !process.env.DB_NAME) {
  console.error('Erreur: Variables d\'environnement de base de données manquantes.');
  console.error('Veuillez vérifier votre fichier .env');
  process.exit(1);
}

// Configuration de la connexion à la base de données
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

// Fonction pour tester la connexion à la base de données
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connexion à la base de données PostgreSQL réussie');
    client.release();
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
  }
};

// Fonction utilitaire pour exécuter des requêtes SQL
const query = async (text: string, params?: any[]) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête SQL:', error);
    throw error;
  }
};

export { pool, query, testConnection };