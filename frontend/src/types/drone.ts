// src/types/drone.ts

/** Modes de mission supportés */
export type MissionMode = 'auto' | 'man';

/** Drone (en base) */
export interface Drone {
  droneId: number;
  droneName: string;
  centerId: number | null;
  droneImage?: string | null;
  droneStatus?: string | null;
}

/** Patch autorisé pour update */
export type DroneUpdate = Partial<
  Pick<Drone, 'droneName' | 'centerId' | 'droneImage' | 'droneStatus'>
>;

/** Waypoint (champ minimaux + champs avancés optionnels compatibles QGC WPL) */
export interface DroneWaypoint {
  lat: number;
  lon: number;
  alt: number;

  seq?: number;
  current?: number;
  frame?: number;
  command?: number;
  param1?: number;
  param2?: number;
  param3?: number;
  param4?: number;
  autoContinue?: number;
}

/** Mission à créer/envoyer au drone */
export interface DroneMission {
  filename: string;
  altitude_takeoff: number;
  mode: MissionMode;
  waypoints: DroneWaypoint[];
  /** Overrides optionnels du point de départ (utilisés seulement si lat & lon fournis) */
  startlat?: number;
  startlon?: number;
  startalt?: number;
}

/** Télémetrie (shape renvoyée par le back) */
export interface FlightInfo {
  state: 'offline' | 'idle' | 'flying' | 'unknown' | null;
  unavailable: boolean;
  reason: string | null;
  updated_at: string;

  is_armed: boolean | null;
  flight_mode: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude_m: number | null;
  horizontal_speed_m_s: number | null;
  vertical_speed_m_s: number | null;
  heading_deg: number | null;
  movement_track_deg: number | null;
  battery_remaining_percent: number | null;

  drone_id?: string | null;
}


/** Commandes de vol possibles (extensible) */
export type CommandMode =
  | 'RTL'
  | 'AUTO'
  | 'GUIDED'
  | 'LOITER'
  | 'LAND'
  | 'POSHOLD'
  | 'STABILIZE'
  | 'ALT_HOLD'
  | 'RETURN'
  | string;

/** Statut d’un drone (sync) */
export type DroneStatus = {
  droneId: number;
  isOnline: boolean;
  lastSyncAt: string;
};

/** Agrégat historique (drones + deliveries + hospitals + centers) */
export interface DroneHistoryItem {
  droneId: number;
  droneName: string | null;
  droneStatus: string | null;
  droneImage: string | null;

  // Delivery
  deliveryId: number | null;
  deliveryStatus: string | null;
  deliveryUrgent: number | boolean | null;
  dteDelivery: string | null;
  dteValidation: string | null;

  // Hospital
  hospitalName: string | null;
  hospitalCity: string | null;

  // Center
  centerCity: string | null;
}

/** Paramètres utilitaires pour créer une mission “pickup → delivery” */
export interface DeliveryMissionParams {
  pickupLat: number;
  pickupLon: number;
  deliveryLat: number;
  deliveryLon: number;
  altitude: number;
}

/** Réponse du back lors de la création de mission (utile pour enchaîner l’envoi) */
export type CreateMissionResponse = {
  message: string;
  filename: string;
  offline?: boolean;
  age_sec?: { position?: number; heartbeat?: number };
};
export type MissionFile = {
  name: string;
  sizeBytes: number;
  modifiedAt: string; // ISO
};

export type MissionsList = {
  count: number;
  files: MissionFile[];
};

/** /drones/status : schéma encore libre côté back */
export type DronesStatus = unknown;
