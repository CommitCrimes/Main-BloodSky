import { api } from './api';
import type { 
  BloodStock, 
  DonationCenter, 
  OrderRequest, 
  OrderResponse,
  BloodTypeCount 
} from '../types/order';

export const orderApi = {
  // Récupérer tous les centres de donation
  getDonationCenters: async (): Promise<DonationCenter[]> => {
    const response = await api.get('/donation-centers');
    return response.data;
  },

  // Récupérer le stock de sang disponible (non assigné à une livraison)
  getAvailableBloodStock: async (): Promise<BloodStock[]> => {
    const response = await api.get('/blood/available');
    return response.data;
  },

  // Récupérer le stock par centre (si nécessaire plus tard)
  getBloodStockByCenter: async (centerId: number): Promise<BloodStock[]> => {
    const response = await api.get(`/blood/available?centerId=${centerId}`);
    return response.data;
  },

  // Passer une commande
  createOrder: async (orderRequest: OrderRequest): Promise<OrderResponse> => {
    const response = await api.post('/blood/order', orderRequest);
    return response.data;
  },

  // Récupérer les statistiques de stock par type de sang
  getBloodStockStats: async (): Promise<BloodTypeCount[]> => {
    const response = await api.get('/blood/stats');
    return response.data;
  },

  // Annuler une commande en attente
  cancelOrder: async (deliveryId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/blood/cancel-order/${deliveryId}`);
    return response.data;
  }
};