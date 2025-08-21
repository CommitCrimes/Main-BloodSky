// services/drone-control.service.ts
import { DroneMission, DroneApiResponse, DroneWaypoint, NormalizedFlightInfo } from '../types/drone.types';

// Optionnel : petit type pour structurer la réponse "current mission"
type MissionCurrentPayload = {
  count: number;
  items: DroneWaypoint[];
};

export class DroneControlService {
  private static instance: DroneControlService;
  private constructor() {}

  static getInstance(): DroneControlService {
    if (!DroneControlService.instance) {
      DroneControlService.instance = new DroneControlService();
    }
    return DroneControlService.instance;
  }

  private normalizeFlightInfo(raw: any = {}, overrides: Partial<NormalizedFlightInfo> = {}): NormalizedFlightInfo {
    return {
      state: raw?.state ?? null,
      is_armed: typeof raw?.is_armed === 'boolean' ? raw.is_armed : null,
      flight_mode: raw?.flight_mode ?? null,
      battery_remaining_percent: typeof raw?.battery_remaining_percent === 'number' ? raw.battery_remaining_percent : null,
      latitude: typeof raw?.latitude === 'number' ? raw.latitude : null,
      longitude: typeof raw?.longitude === 'number' ? raw.longitude : null,
      altitude_m: typeof raw?.altitude_m === 'number' ? raw.altitude_m : null,
      horizontal_speed_m_s: typeof raw?.horizontal_speed_m_s === 'number' ? raw.horizontal_speed_m_s : null,
      heading_deg: typeof raw?.heading_deg === 'number' ? raw.heading_deg : null,
      movement_track_deg: typeof raw?.movement_track_deg === 'number' ? raw.movement_track_deg : null,
      updated_at: new Date().toISOString(),
      unavailable: false,
      reason: null,
      ...overrides,
    };
  }

  /**
   * Get drone API URL by drone ID
   */
  private async getDroneApiUrl(_droneId: number): Promise<string | null> {
    // Pour l’instant, URL fixe
    return 'http://localhost:5000';
  }

  /**
   * Create a mission for a drone
   */
  async createMission(droneId: number, mission: DroneMission): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/mission/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mission),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const result = await response.json();
      // ⛔️ plus d’update DB ici
      return result;
    } catch (error) {
      console.error(`Failed to create mission for drone ${droneId}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Start a mission for a drone
   */
  async startMission(droneId: number): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const result = await response.json();
      // ⛔️ plus d’update DB ici
      return result;
    } catch (error) {
      console.error(`Failed to start mission for drone ${droneId}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Return drone to home
   */
  async returnToHome(droneId: number): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'rtl' }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const result = await response.json();
      // ⛔️ plus d’update DB ici
      return result;
    } catch (error) {
      console.error(`Failed to return drone ${droneId} to home:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Modify a mission waypoint
   */
  async modifyMission(
    droneId: number,
    filename: string,
    seq: number,
    updates: Partial<DroneWaypoint>,
  ): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/mission/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, seq, updates }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const result = await response.json();
      // ⛔️ plus d’update DB ici
      return result;
    } catch (error) {
      console.error(`Failed to modify mission for drone ${droneId}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send a mission file to drone
   */
  async sendMissionFile(droneId: number, filename: string): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/mission/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const result = await response.json();
      // ⛔️ plus d’update DB ici
      return result;
    } catch (error: any) {
      console.error(`Failed to send mission for drone ${droneId}:`, error);
      return { error: error?.message || 'sendMissionFile failed' };
    }
  }

  /**
   * Change drone flight mode
   */
  async changeFlightMode(droneId: number, mode: string): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Failed to change flight mode for drone ${droneId}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get flight info for a specific drone
   * (ne met plus à jour la DB; renvoie juste une télémétrie normalisée)
   */
  async getFlightInfo(droneId: number): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/flight_info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        let raw: any = null;
        try { raw = await response.json(); } catch { /* ignore */ }
        const info = this.normalizeFlightInfo(raw);
        return { data: info };
      }

      // Non-2xx -> considérer indisponible
      let reason = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const j = await response.json();
        if (j?.error) reason = j.error;
      } catch { /* ignore */ }
      const info = this.normalizeFlightInfo({}, { state: 'offline', unavailable: true, reason });
      return { data: info };
    } catch (error) {
      // Timeout / ECONNREFUSED / etc.
      const info = this.normalizeFlightInfo(
        {},
        { state: 'offline', unavailable: true, reason: (error as Error)?.message ?? 'fetch_failed' },
      );
      return { data: info };
    }
  }

  /**
   * Create a simple delivery mission
   */
  async createDeliveryMission(
    droneId: number,
    pickupLat: number,
    pickupLon: number,
    deliveryLat: number,
    deliveryLon: number,
    altitude: number = 50,
  ): Promise<DroneApiResponse> {
    const waypoints: DroneWaypoint[] = [
      { seq: 0, lat: pickupLat, lon: pickupLon, alt: altitude, command: 16 },
      { seq: 1, lat: deliveryLat, lon: deliveryLon, alt: altitude, command: 16 },
    ];

    const mission: DroneMission = {
      filename: `delivery_mission_${droneId}_${Date.now()}.waypoints`,
      altitude_takeoff: altitude,
      waypoints,
      mode: 'auto',
    };

    return this.createMission(droneId, mission);
  }

  async getMissionCurrent(droneId: number): Promise<{ data?: MissionCurrentPayload; error?: string }> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const res = await fetch(`${apiUrl}/mission/current`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}: ${res.statusText}`;
        try { const j = await res.json(); msg = j?.error || msg; } catch {}
        return { error: msg };
      }

      const data = (await res.json()) as MissionCurrentPayload; // { count, items }
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const droneControlService = DroneControlService.getInstance();
