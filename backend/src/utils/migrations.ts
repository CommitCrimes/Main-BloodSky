import fs from 'fs';
import path from 'path';
import { pool } from './db';

// Table de migration pour suivre les migrations appliquées
const createMigrationTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

// Fonction pour appliquer les migrations
const applyMigrations = async () => {
  console.log('Démarrage des migrations de la base de données...');
  
  try {
    // Créer la table de migrations si elle n'existe pas
    await createMigrationTable();
    
    // Récupérer tous les fichiers de migration
    const migrationsDir = path.join(__dirname, '../../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Assure que les migrations s'exécutent dans le bon ordre
    
    // Récupérer les migrations déjà appliquées
    const { rows } = await pool.query('SELECT name FROM migrations');
    const appliedMigrations = rows.map(row => row.name);
    
    // Appliquer les nouvelles migrations
    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        console.log(`Application de la migration: ${file}`);
        
        // Lire le fichier de migration
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Commencer la transaction
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          // Exécuter le SQL de migration en un seul bloc pour préserver les blocs DO $$ ... $$
          await client.query(sql);
          
          // Enregistrer la migration
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          
          await client.query('COMMIT');
          console.log(`Migration ${file} appliquée avec succès`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Erreur lors de l'application de la migration ${file}:`, error);
          throw error;
        } finally {
          client.release();
        }
      } else {
        console.log(`Migration ${file} déjà appliquée`);
      }
    }
    
    console.log('Toutes les migrations ont été complétées avec succès');
  } catch (error) {
    console.error('Erreur de migration:', error);
    throw error;
  }
};

export { applyMigrations };