// services/drone-control.service.ts
import { DroneMission, DroneApiResponse, DroneWaypoint, NormalizedFlightInfo } from '../types/drone.types';

type MissionCurrentPayload = {
  count: number;
  items: DroneWaypoint[];
};
type MissionsList = { count: number; files: Array<{ name: string; sizeBytes: number; modifiedAt: string }> };


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

  private async getDroneApiUrl(_droneId: number): Promise<string | null> {
    return process.env.DRONE_API_BASE ?? 'http://localhost:5000';
  }


  // ── List de missions ──────────────────────────────────────────────
async listMissions(params?: Record<string, string>): Promise<{ data?: MissionsList; error?: string }> {
  const apiUrl = await this.getDroneApiUrl(0);
  if (!apiUrl) return { error: 'Drone API URL not configured' };

  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  try {
    const res = await fetch(`${apiUrl}/missions${qs}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body?.error || `HTTP ${res.status}` };
    return { data: body as MissionsList };
  } catch (e: any) {
    return { error: e?.message || 'listMissions failed' };
  }
}

  // ── FLIGHT INFO ──────────────────────────────────────────────
  async getFlightInfo(droneId: number): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/drones/${droneId}/flight_info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        let raw: any = null;
        try { raw = await response.json(); } catch {}
        const info = this.normalizeFlightInfo(raw);
        return { data: info };
      }

      let reason = `HTTP ${response.status}: ${response.statusText}`;
      try { const j = await response.json(); if (j?.error) reason = j.error; } catch {}
      const info = this.normalizeFlightInfo({}, { state: 'offline', unavailable: true, reason });
      return { data: info };
    } catch (error) {
      const info = this.normalizeFlightInfo({}, { state: 'offline', unavailable: true, reason: (error as Error)?.message ?? 'fetch_failed' });
      return { data: info };
    }
  }

  // ── COMMANDS / MODES ────────────────────────────────────────
  async changeFlightMode(droneId: number, mode: string): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/drones/${droneId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async returnToHome(droneId: number): Promise<DroneApiResponse> {
    // RTL en majuscules (le Flask upper-case de toute façon)
    return this.changeFlightMode(droneId, 'RTL');
  }

  // ── MISSIONS ────────────────────────────────────────────────
  async createMission(droneId: number, mission: DroneMission): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/drones/${droneId}/mission/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mission),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendMissionFile(droneId: number, filename: string): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/drones/${droneId}/mission/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error: any) {
      return { error: error?.message || 'sendMissionFile failed' };
    }
  }

  async modifyMission(droneId: number, filename: string, seq: number, updates: Partial<DroneWaypoint>): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/drones/${droneId}/mission/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, seq, updates }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async startMission(droneId: number): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const response = await fetch(`${apiUrl}/drones/${droneId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getMissionCurrent(droneId: number): Promise<{ data?: MissionCurrentPayload; error?: string }> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) return { error: 'Drone API URL not configured' };

    try {
      const res = await fetch(`${apiUrl}/drones/${droneId}/mission/current`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}: ${res.statusText}`;
        try { const j = await res.json(); msg = j?.error || msg; } catch {}
        return { error: msg };
      }
      const data = (await res.json()) as MissionCurrentPayload;
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Compose une mission de livraison simple + envoi au drone
  async createDeliveryMission(
    droneId: number,
    pickupLat: number, pickupLon: number,
    deliveryLat: number, deliveryLon: number,
    altitude: number = 50,
  ): Promise<DroneApiResponse> {
    const filename = `delivery_mission_${droneId}_${Date.now()}.waypoints`;
    const waypoints: DroneWaypoint[] = [
      { seq: 0, lat: pickupLat,   lon: pickupLon,    alt: altitude, command: 16 },
      { seq: 1, lat: deliveryLat, lon: deliveryLon,  alt: altitude, command: 16 },
    ];
    const mission: DroneMission = {
      filename,
      altitude_takeoff: altitude,
      waypoints,
      mode: 'auto',
    };

    const created = await this.createMission(droneId, mission);
    if ('error' in created) return created;

    const sent = await this.sendMissionFile(droneId, filename);
    if ('error' in sent) return sent;

    return { data: { message: 'Delivery mission created and sent', filename } };
  }
}

export const droneControlService = DroneControlService.getInstance();
