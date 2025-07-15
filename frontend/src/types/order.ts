
export interface BloodStock {
  bloodType: string;
  availableQuantity: number;
  bloodIds: number[]; // IDs des poches dispo
}

export interface DonationCenter {
  centerId: number;
  centerCity: string;
  centerPostal: number;
  centerAdress: string;
  centerLatitude: string;
  centerLongitude: string;
}

export interface OrderRequest {
  hospitalId: number;
  centerId: number;
  bloodType: string;
  quantity: number;
  isUrgent: boolean;
  notes?: string;
}

export interface OrderResponse {
  success: boolean;
  deliveryId?: number;
  message: string;
  bloodIds?: number[]; // IDs des poches assignées
}

export interface OrderFilters {
  bloodType?: string;
  centerId?: number;
  isUrgent?: boolean;
}

export interface BloodTypeCount {
  bloodType: string;
  count: number;
}

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodType = typeof BLOOD_TYPES[number];