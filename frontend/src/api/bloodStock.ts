import api from './api';

export interface BloodStock {
  bloodType: string;
  quantity: number;
  bloodIds: number[];
}

export interface BloodItem {
  bloodId: number;
  bloodType: string;
  deliveryId: number | null;
}

export const bloodStockApi = {
  getStockByCenter: async (centerId: number): Promise<BloodStock[]> => {
    const response = await api.get(`/blood/center/${centerId}`);
    return response.data;
  },

  getAvailableStock: async (): Promise<BloodStock[]> => {
    const response = await api.get('/blood/available');
    return response.data;
  },

  addStock: async (bloodType: string, quantity: number, centerId: number) => {
    const response = await api.post('/blood/add-stock', {
      bloodType,
      quantity,
      centerId
    });
    return response.data;
  },

  removeStock: async (bloodType: string, quantity: number, centerId: number, reason?: string) => {
    const response = await api.post('/blood/remove-stock', {
      bloodType,
      quantity,
      centerId,
      reason
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/blood/stats');
    return response.data;
  }
};