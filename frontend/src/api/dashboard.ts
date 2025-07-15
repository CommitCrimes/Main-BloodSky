import { api } from './api';

export interface DeliveryStats {
  name: string;
  livraisons: number;
  echecs: number;
}

export interface StatusStats {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStats {
  statusStats: StatusStats[];
  deliveryData: DeliveryStats[];
}

export const dashboardApi = {
  getDeliveryStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/delivery-stats');
    return response.data;
  }
};