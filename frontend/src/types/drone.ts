export type MissionMode = 'auto' | 'man';

export interface DroneWaypoint {
  lat: number;
  lon: number;
  alt: number;
}

export interface DroneMission {
  filename: string;
  altitude_takeoff: number;
  mode: MissionMode;
  waypoints: DroneWaypoint[];
}

// Aligne avec ce que renvoie ton API drones
export interface FlightInfo {
  latitude: number;
  longitude: number;
  altitude_m: number;
  vertical_speed_m_s: number;
  horizontal_speed_m_s: number;
  heading_deg: number;
  movement_track_deg: number;
  flight_mode: string;
  is_armed: boolean;
  battery_remaining_percent?: number;
}
