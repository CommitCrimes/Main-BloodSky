// src/api/donation_center.ts

import { api } from './api';

export interface DonationCenter {
  centerId: number;
  centerName: string;
  centerAddress: string;
  centerPostal: number;
  centerCity: string;
  latitude: number;
  longitude: number;
}

export const donationCenterApi = {
  // Obtenir un centre par son ID
  getCenterById: async (id: number): Promise<DonationCenter> => {
    const response = await api.get(`/donation-centers/${id}`);
    return response.data;
  },

  // Obtenir tous les centres
  getAllCenters: async (): Promise<DonationCenter[]> => {
    const response = await api.get('/donation-centers');
    return response.data;
  },

  // Rechercher un centre par code postal
  getCentersByPostalCode: async (postalCode: number): Promise<DonationCenter[]> => {
    const response = await api.get(`/donation-centers/postal/${postalCode}`);
    return response.data;
  },
};
