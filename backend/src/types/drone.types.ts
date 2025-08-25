export interface DroneFlightInfo {
  drone_id: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  horizontal_speed_m_s: number;
  vertical_speed_m_s: number;
  heading_deg: number;
  is_armed: boolean;
  flight_mode: string;
}

export interface DroneWaypoint {
  seq: number;
  current?: number;
  frame?: number;
  command?: number;
  param1?: number;
  param2?: number;
  param3?: number;
  param4?: number;
  lat: number;
  lon: number;
  alt: number;
  autoContinue?: number;
}

export interface DroneMission {
  filename: string;
  altitude_takeoff: number;
  waypoints: DroneWaypoint[];
  mode: 'auto' | 'man';
}

export interface DroneApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface DroneStatus {
  droneId: number;
  isOnline: boolean;
  lastSyncAt: Date | null;
}

export interface DroneUpdate {
  droneStatus?: string;
  lastSyncAt?: Date;
}

export type NormalizedFlightInfo = {
  state: 'offline' | 'idle' | 'flying' | 'unknown' | null;
  is_armed: boolean | null;
  flight_mode: string | null;
  battery_remaining_percent: number | null;
  latitude: number | null;
  longitude: number | null;
  altitude_m: number | null;
  horizontal_speed_m_s: number | null;
  heading_deg: number | null;
  movement_track_deg: number | null;
  updated_at: string;
  unavailable: boolean;
  reason: string | null;
};



export enum DroneFlightMode {
  STABILIZE = 'STABILIZE',
  ACRO = 'ACRO',
  ALT_HOLD = 'ALT_HOLD',
  AUTO = 'AUTO',
  GUIDED = 'GUIDED',
  LOITER = 'LOITER',
  RTL = 'RTL',
  CIRCLE = 'CIRCLE',
  LAND = 'LAND',
  DRIFT = 'DRIFT',
  SPORT = 'SPORT',
  FLIP = 'FLIP',
  AUTOTUNE = 'AUTOTUNE',
  POSHOLD = 'POSHOLD',
  BRAKE = 'BRAKE',
  THROW = 'THROW',
  AVOID_ADSB = 'AVOID_ADSB',
  GUIDED_NOGPS = 'GUIDED_NOGPS',
  SMART_RTL = 'SMART_RTL',
  FLOWHOLD = 'FLOWHOLD',
  FOLLOW = 'FOLLOW',
  ZIGZAG = 'ZIGZAG',
  SYSTEMID = 'SYSTEMID',
  AUTOROTATE = 'AUTOROTATE',
  AUTO_RTL = 'AUTO_RTL'
}

export enum DroneMissionStatus {
  IDLE = 'IDLE',
  CREATING = 'CREATING',
  READY = 'READY',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum DroneCommandType {
  WAYPOINT = 16,
  TAKEOFF = 22,
  LAND = 21,
  RTL = 20,
  LOITER_UNLIM = 17,
  LOITER_TURNS = 18,
  LOITER_TIME = 19
}