import { Hono } from 'hono';
import { superAdminController } from '../controllers/superadmin.controller';
import { superAdminAuth, logSuperAdminAction } from '../middleware/superadmin.middleware';

export const superAdminRouter = new Hono();

// Appliquer les middlewares d'authentification à toutes les routes
superAdminRouter.use('*', superAdminAuth);
superAdminRouter.use('*', logSuperAdminAction);

/**
 * =============== ROUTES SUPER ADMIN ===============
 * 
 * Toutes les routes super admin avec authentification requise
 * 
 * Routes disponibles :
 * - GET /superadmin/admins - Liste tous les administrateurs
 * - GET /superadmin/admins/:id - Détails d'un administrateur
 * - PUT /superadmin/admins/:id - Modifier un administrateur
 * - DELETE /superadmin/admins/:id - Supprimer un administrateur
 * - GET /superadmin/users - Liste tous les utilisateurs
 * - GET /superadmin/deliveries - Historique des livraisons (avec filtres)
 * - GET /superadmin/statistics - Statistiques globales
 */

// =============== ENREGISTREMENT DES ROUTES ===============

// GET /superadmin/admins - Récupérer tous les admins
superAdminRouter.get('/admins', superAdminController.getAllAdmins);

// GET /superadmin/admins/:id - Récupérer un admin par ID
superAdminRouter.get('/admins/:id', superAdminController.getAdminById);

// PUT /superadmin/admins/:id - Mettre à jour un admin
superAdminRouter.put('/admins/:id', superAdminController.updateAdmin);

// DELETE /superadmin/admins/:id - Supprimer un admin
superAdminRouter.delete('/admins/:id', superAdminController.deleteAdmin);

// GET /superadmin/users - Récupérer tous les utilisateurs
superAdminRouter.get('/users', superAdminController.getAllUsers);

// GET /superadmin/deliveries - Historique des livraisons
superAdminRouter.get('/deliveries', superAdminController.getDeliveryHistory);

// GET /superadmin/statistics - Statistiques globales
superAdminRouter.get('/statistics', superAdminController.getStatistics);