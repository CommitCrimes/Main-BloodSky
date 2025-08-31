interface BaseHistoryItem {
  id: string;
  deliveryId: number;
  requestDate: Date;
  deliveryDate: Date | null;
  validationDate: Date | null;
  personIdentity: string;
  deliveryStatus: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  isUrgent: boolean;
  bloodType?: string;
  droneId?: number;
  droneName?: string;
}
export interface CenterRef {
  centerId: number;
  centerCity: string;
  centerAddress: string; // ⚠ aligne avec le back (pas "centerAdress")
  latitude: number;
  longitude: number;
}
export interface HospitalRef {
  hospitalId: number;
  hospitalName: string;
  hospitalCity: string;
  hospitalAddress: string;
  latitude: number;
  longitude: number;
}

export interface DonationCenterHistory extends BaseHistoryItem {
  sourceDonationCenter: CenterRef;
  type: 'delivery';
  destinationHospital: {
    hospitalId: number;
    hospitalName: string;
    hospitalCity: string;
    hospitalAddress: string;
    latitude: number;
    longitude: number;
  };
  departureCoordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface HospitalHistory extends BaseHistoryItem {
  type: 'order';
  sourceDonationCenter: {
    centerId: CenterRef;
    centerCity: string;
    centerAddress: string;
    latitude: number;
    longitude: number;
  };
  arrivalCoordinates: {
    latitude: number;
    longitude: number;
  };
}

export type DeliveryHistory = DonationCenterHistory | HospitalHistory;

export interface HistoryFilters {
  status?: DeliveryHistory['deliveryStatus'];
  isUrgent?: boolean;
  centerId?: number; 
}

export interface HistorySortConfig {
  field: 'personIdentity' | 'destinationName' | 'sourceName' | 'requestDate' | 'deliveryId' | 'bloodType';
  direction: 'asc' | 'desc';
}
export interface DroneHistorySortConfig {
  field:
    | 'personIdentity'
    | 'destinationName'
    | 'sourceName'
    | 'deliveryId'
    | 'bloodType'
    | 'deliveryDate'
    | 'requestDate'
    | 'validationDate'
    
  direction: 'asc' | 'desc';
}


export interface HistorySearchConfig {
  searchTerm: string;
}

