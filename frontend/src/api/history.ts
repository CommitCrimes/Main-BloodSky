import { api } from './api';
import type { DonationCenterHistory, HospitalHistory } from '../types/history';

// Types pour les entités de base de données
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

export interface Delivery {
  deliveryId: number;
  droneId?: number;
  bloodId?: number;
  hospitalId: number;
  centerId: number;
  dteDelivery?: string;
  dteValidation?: string;
  deliveryStatus: string;
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

// drones de test à ignorer
const IGNORE_DRONE_IDS = new Set<number>([0]);

const filterOutTestDrones = <T extends { droneId?: number | string }>(list: T[]): T[] =>
  list.filter(d => !IGNORE_DRONE_IDS.has(Number(d.droneId)));


// API pour récupérer les données d'historique
export const historyApi = {
  // Récupérer tous les hôpitaux
  getHospitals: async (): Promise<Hospital[]> => {
    const response = await api.get('/hospitals');
    return response.data;
  },

  // Récupérer tous les centres de donation
  getDonationCenters: async (): Promise<DonationCenter[]> => {
    const response = await api.get('/donation-centers');
    return response.data;
  },

  // Récupérer toutes les livraisons
  getDeliveries: async (): Promise<Delivery[]> => {
    const response = await api.get('/deliveries');
    return response.data;
  },

  // Récupérer les drones
  getDrones: async (): Promise<Drone[]> => {
    const response = await api.get('/drones');
    return filterOutTestDrones(response.data as Drone[]);
  },

  // Récupérer les types de sang
  getBloodTypes: async (): Promise<Blood[]> => {
    const response = await api.get('/blood');
    return response.data;
  },



  // Récupérer l'historique pour un centre de donation
  getDonationCenterHistory: async (centerId: number): Promise<DonationCenterHistory[]> => {
    const [deliveries, hospitals, drones, bloodTypes, donationCenters] = await Promise.all([
      historyApi.getDeliveries(),
      historyApi.getHospitals(),
      historyApi.getDrones(),
      historyApi.getBloodTypes(),
      historyApi.getDonationCenters()
    ]);

    // Filtrer les livraisons pour ce centre
    const centerDeliveries = deliveries.filter(delivery => delivery.centerId === centerId);
    const currentCenter = donationCenters.find(c => c.centerId === centerId);

    // Créer l'historique avec les données jointes
    return centerDeliveries.map(delivery => {
      const hospital = hospitals.find(h => h.hospitalId === delivery.hospitalId);
      const drone = drones.find(d => d.droneId === delivery.droneId);
      // Chercher le type de sang parmi les poches assignées à cette livraison
      const blood = bloodTypes.find(b => b.deliveryId === delivery.deliveryId);

      if (!hospital) {
        throw new Error(`Hospital not found for delivery ${delivery.deliveryId}`);
      }

      return {
        id: delivery.deliveryId.toString(),
        deliveryId: delivery.deliveryId,
        type: 'delivery' as const,
        requestDate: delivery.dteDelivery ? new Date(delivery.dteDelivery) : new Date(),
        deliveryDate: delivery.dteValidation ? new Date(delivery.dteValidation) : null,
        validationDate: delivery.dteValidation ? new Date(delivery.dteValidation) : null,
        personIdentity: 'Système', // À adapter selon vos besoins
        deliveryStatus: delivery.deliveryStatus as any,
        isUrgent: delivery.deliveryUrgent,
        bloodType: blood?.bloodType,
        droneId: drone?.droneId,
        droneName: drone?.droneName,
        sourceDonationCenter: currentCenter
          ? {
            centerId: currentCenter.centerId,
            centerCity: currentCenter.centerCity,
            centerName: currentCenter.centerCity, // fallback if no name property
            centerAddress: currentCenter.centerAdress,
            latitude: parseFloat(currentCenter.centerLatitude),
            longitude: parseFloat(currentCenter.centerLongitude)
          }
          : {
            centerId: 0,
            centerCity: '',
            centerName: '',
            centerAddress: '',
            latitude: 0,
            longitude: 0
          },
        destinationHospital: {
          hospitalId: hospital.hospitalId,
          hospitalName: hospital.hospitalName,
          hospitalCity: hospital.hospitalCity,
          hospitalAddress: hospital.hospitalAdress,
          latitude: parseFloat(hospital.hospitalLatitude),
          longitude: parseFloat(hospital.hospitalLongitude)
        },
        departureCoordinates: {
          latitude: currentCenter ? parseFloat(currentCenter.centerLatitude) : 0,
          longitude: currentCenter ? parseFloat(currentCenter.centerLongitude) : 0
        }
      };
    });
  },

  // Récupérer l'historique pour un hôpital
  getHospitalHistory: async (hospitalId: number): Promise<HospitalHistory[]> => {
    const [deliveries, donationCenters, drones, bloodTypes, hospitals] = await Promise.all([
      historyApi.getDeliveries(),
      historyApi.getDonationCenters(),
      historyApi.getDrones(),
      historyApi.getBloodTypes(),
      historyApi.getHospitals()
    ]);

    // Filtrer les livraisons pour cet hôpital
    const hospitalDeliveries = deliveries.filter(delivery => delivery.hospitalId === hospitalId);
    const currentHospital = hospitals.find(h => h.hospitalId === hospitalId);

    // Créer l'historique avec les données jointes
    return hospitalDeliveries.map(delivery => {
      const center = donationCenters.find(c => c.centerId === delivery.centerId);
      const drone = drones.find(d => d.droneId === delivery.droneId);
      // Chercher le type de sang parmi les poches assignées à cette livraison
      const blood = bloodTypes.find(b => b.deliveryId === delivery.deliveryId);

      if (!center) {
        throw new Error(`Donation center not found for delivery ${delivery.deliveryId}`);
      }

      return {
        id: delivery.deliveryId.toString(),
        deliveryId: delivery.deliveryId,
        type: 'order' as const,
        requestDate: delivery.dteDelivery ? new Date(delivery.dteDelivery) : new Date(),
        deliveryDate: delivery.dteValidation ? new Date(delivery.dteValidation) : null,
        validationDate: delivery.dteValidation ? new Date(delivery.dteValidation) : null,
        personIdentity: 'Système', // À adapter selon vos besoins
        deliveryStatus: delivery.deliveryStatus as any,
        isUrgent: delivery.deliveryUrgent,
        bloodType: blood?.bloodType,
        droneId: drone?.droneId,
        droneName: drone?.droneName,
        sourceDonationCenter: {
          centerId: center.centerId,
          centerCity: center.centerCity,
          centerAddress: center.centerAdress,
          latitude: parseFloat(center.centerLatitude),
          longitude: parseFloat(center.centerLongitude)
        },
        arrivalCoordinates: {
          latitude: currentHospital ? parseFloat(currentHospital.hospitalLatitude) : 0,
          longitude: currentHospital ? parseFloat(currentHospital.hospitalLongitude) : 0
        }
      };
    });
  },

  getDroneDeliveryHistory: async (): Promise<DonationCenterHistory[]> => {
    const [deliveries, hospitals, donationCenters, drones, bloodTypes] = await Promise.all([
      historyApi.getDeliveries(),
      historyApi.getHospitals(),
      historyApi.getDonationCenters(),
      historyApi.getDrones(),
      historyApi.getBloodTypes()
    ]);

    return deliveries.map(delivery => {
      const drone = drones.find(d => d.droneId === delivery.droneId);
      const center = donationCenters.find(c => c.centerId === delivery.centerId);
      const hospital = hospitals.find(h => h.hospitalId === delivery.hospitalId);
      const blood = bloodTypes.find(b => b.deliveryId === delivery.deliveryId);

      return {
        id: delivery.deliveryId.toString(),
        deliveryId: delivery.deliveryId,
        type: 'delivery',
        requestDate: delivery.dteDelivery ? new Date(delivery.dteDelivery) : new Date(),
        deliveryDate: delivery.dteValidation ? new Date(delivery.dteValidation) : null,
        validationDate: delivery.dteValidation ? new Date(delivery.dteValidation) : null,
        personIdentity: 'Système',
        deliveryStatus: delivery.deliveryStatus as any,
        isUrgent: delivery.deliveryUrgent,
        bloodType: blood?.bloodType ?? 'Inconnu',
        droneId: drone?.droneId,
        droneName: drone?.droneName ?? 'Non assigné',
        sourceDonationCenter: {
          centerId: center?.centerId ?? 0,
          centerCity: center?.centerCity ?? 'Inconnu',
          centerName: center?.centerCity ?? 'Inconnu', // fallback s'il n'y a pas de nom
          centerAddress: center?.centerAdress ?? '',
          latitude: parseFloat(center?.centerLatitude ?? '0'),
          longitude: parseFloat(center?.centerLongitude ?? '0')
        },
        destinationHospital: {
          hospitalId: hospital?.hospitalId ?? 0,
          hospitalName: hospital?.hospitalName ?? 'Inconnu',
          hospitalCity: hospital?.hospitalCity ?? '',
          hospitalAddress: hospital?.hospitalAdress ?? '',
          latitude: parseFloat(hospital?.hospitalLatitude ?? '0'),
          longitude: parseFloat(hospital?.hospitalLongitude ?? '0')
        },
        departureCoordinates: {
          latitude: parseFloat(center?.centerLatitude ?? '0'),
          longitude: parseFloat(center?.centerLongitude ?? '0')
        }
      };
    });
  }

};