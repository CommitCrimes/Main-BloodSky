// --- Entités de base (DB/API) ---
export interface Hospital {
  hospitalId: number;
  hospitalName: string;
  hospitalCity: string;
  hospitalPostal: number;
  hospitalAdress: string;
  hospitalLatitude: string;
  hospitalLongitude: string;
}

export interface DonationCenter {
  centerId: number;
  centerCity: string;
  centerPostal: number;
  centerAdress: string;
  centerLatitude: string;
  centerLongitude: string;
}

export type DeliveryStatus = 'pending' | 'in_progress' | 'delivered' | 'cancelled'; // adapte si besoin

export interface Delivery {
  deliveryId: number;
  droneId?: number;
  bloodId?: number;
  hospitalId: number;
  centerId: number;
  dteDelivery?: string;
  dteValidation?: string;
  deliveryStatus: DeliveryStatus | string; // si ton backend renvoie autre chose
  deliveryUrgent: boolean;
}

export interface Drone {
  droneId: number;
  droneName: string;
  centerId: number;
  droneStatus: string;
  droneCurrentLat?: number;
  droneCurrentLong?: number;
  droneBattery?: string;
  droneImage?: string;
}

export interface Blood {
  bloodId: number;
  bloodType: string;
  deliveryId?: number;
}

// Variantes légères quand tu n’as besoin que d’un sous-ensemble
export type HospitalLite = Pick<Hospital, 'hospitalId' | 'hospitalName'>;
export type DonationCenterLite = Pick<DonationCenter, 'centerId' | 'centerCity'>;
