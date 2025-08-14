// src/types/delivery.ts

export type DeliveryStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;

export interface Delivery {
    deliveryId: number;
    droneId: number | null;
    hospitalId: number;
    centerId: number;
    deliveryStatus: DeliveryStatus;
    dteCreation?: string;
    dteValidation?: string | null;
    isUrgent?: boolean;
    [key: string]: unknown;
}

export interface DeliveryParticipation {
    deliveryId: number;
    userId: number;
    dteCreate?: string;
}

export type DeliveryWithParticipants = Delivery & {
    participants: DeliveryParticipation[];
};

/** Création */
export type CreateDeliveryRequest = {
    hospitalId: number;
    centerId: number;
    deliveryStatus?: DeliveryStatus;
    dteCreation?: string;
    dteValidation?: string | null;
    droneId: number | null;
};

/** Update */
export type UpdateDeliveryRequest = Partial<{
    deliveryStatus: DeliveryStatus;
    dteValidation: string | null;
    droneId: number | null;
}>;

export type DroneDelivery = {
  deliveryId: number;
  deliveryStatus: string;
  deliveryUrgent: boolean;
  dteDelivery: string;
  dteValidation: string;
  hospitalName: string;
  hospitalCity: string;
}

export type DroneHistory = {
  droneId: number;
  droneName: string;
  droneStatus: string;
  droneImage: string;
  deliveryId: number;
  deliveryStatus: string;
  deliveryUrgent: boolean;
  dteDelivery: string;
  dteValidation: string;
  hospitalName: string;
  hospitalCity: string;
  centerCity: string;
  deliveries?: DroneDelivery[];
}

