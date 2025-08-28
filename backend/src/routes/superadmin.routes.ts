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

// =============== GESTION DES HÔPITAUX ===============

// GET /superadmin/hospitals - Récupérer tous les hôpitaux
superAdminRouter.get('/hospitals', superAdminController.getAllHospitals);

// GET /superadmin/hospitals/:id - Récupérer un hôpital par ID
superAdminRouter.get('/hospitals/:id', superAdminController.getHospitalById);

// POST /superadmin/hospitals - Créer un nouvel hôpital
superAdminRouter.post('/hospitals', superAdminController.createHospital);

// PUT /superadmin/hospitals/:id - Mettre à jour un hôpital
superAdminRouter.put('/hospitals/:id', superAdminController.updateHospital);

// DELETE /superadmin/hospitals/:id - Supprimer un hôpital
superAdminRouter.delete('/hospitals/:id', superAdminController.deleteHospital);

// =============== GESTION DES CENTRES DE DON ===============

// GET /superadmin/centers - Récupérer tous les centres de don
superAdminRouter.get('/centers', superAdminController.getAllCenters);

// GET /superadmin/centers/:id - Récupérer un centre par ID
superAdminRouter.get('/centers/:id', superAdminController.getCenterById);

// POST /superadmin/centers - Créer un nouveau centre de don
superAdminRouter.post('/centers', superAdminController.createCenter);

// PUT /superadmin/centers/:id - Mettre à jour un centre de don
superAdminRouter.put('/centers/:id', superAdminController.updateCenter);

// DELETE /superadmin/centers/:id - Supprimer un centre de don
superAdminRouter.delete('/centers/:id', superAdminController.deleteCenter);