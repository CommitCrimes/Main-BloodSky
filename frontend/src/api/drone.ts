const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export type DroneMeta = {
  droneId: number;
  droneName: string;
  centerId: number;   // <= important for linking to the center
  droneImage?: string;
  droneStatus?: string;
};

export type FlightInfo = {
  drone_id: string;
  is_armed: boolean;
  flight_mode: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  horizontal_speed_m_s: number;
  vertical_speed_m_s: number;
  heading_deg: number;
  movement_track_deg: number;
  battery_remaining_percent: number;
};

export const dronesApi = {
  getById: async (id: number): Promise<DroneMeta> => {
    const r = await fetch(`${BASE}/drones/${id}`);
    if (!r.ok) throw new Error('Drone not found');
    return r.json();
  },
  getFlightInfo: async (id: number): Promise<FlightInfo> => {
    const r = await fetch(`${BASE}/drones/${id}/flight_info`);
    if (!r.ok) throw new Error('Failed to fetch flight info');
    return r.json();
  },
};
