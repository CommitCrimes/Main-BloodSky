import { db } from '../utils/db';
import { drones } from '../schemas/drone';
import { eq } from 'drizzle-orm';
import { DroneMission, DroneApiResponse, DroneWaypoint } from '../types/drone.types';

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

  /**
   * Get drone API URL by drone ID
   */
  private async getDroneApiUrl(droneId: number): Promise<string | null> {
    // For now, all drones use the same API URL
    // In the future, this could be configurable per drone or environment-based
    return 'http://localhost:5000';
  }

  /**
   * Create a mission for a drone
   */
  async createMission(droneId: number, mission: DroneMission): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) {
      return { error: 'Drone API URL not configured' };
    }

    try {
      const response = await fetch(`${apiUrl}/mission/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mission),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update drone status in database
      await db
        .update(drones)
        .set({ 
          droneStatus: 'ready'
        })
        .where(eq(drones.droneId, droneId));

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
    if (!apiUrl) {
      return { error: 'Drone API URL not configured' };
    }

    try {
      const response = await fetch(`${apiUrl}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update mission status in database
      await db
        .update(drones)
        .set({ 
          droneStatus: 'active'
        })
        .where(eq(drones.droneId, droneId));

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
    if (!apiUrl) {
      return { error: 'Drone API URL not configured' };
    }

    try {
      const response = await fetch(`${apiUrl}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'rtl' }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update mission status in database
      await db
        .update(drones)
        .set({ 
          droneStatus: 'returning'
        })
        .where(eq(drones.droneId, droneId));

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
    updates: Partial<DroneWaypoint>
  ): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) {
      return { error: 'Drone API URL not configured' };
    }

    try {
      const response = await fetch(`${apiUrl}/mission/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          seq,
          updates
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update mission status in database
      await db
        .update(drones)
        .set({ 
          droneStatus: 'modified'
        })
        .where(eq(drones.droneId, droneId));

      return result;
    } catch (error) {
      console.error(`Failed to modify mission for drone ${droneId}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send a mission file to drone
   */
// services/drone-control.service.ts
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

    await db.update(drones)
      .set({ droneStatus: 'uploaded' })
      .where(eq(drones.droneId, droneId));

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
    if (!apiUrl) {
      return { error: 'Drone API URL not configured' };
    }

    try {
      const response = await fetch(`${apiUrl}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Note: flight mode is now handled by drone API directly
      // No need to update database as flight_mode is retrieved in real-time

      return result;
    } catch (error) {
      console.error(`Failed to change flight mode for drone ${droneId}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get flight info for a specific drone
   */
  async getFlightInfo(droneId: number): Promise<DroneApiResponse> {
    const apiUrl = await this.getDroneApiUrl(droneId);
    if (!apiUrl) {
      return { error: 'Drone API URL not configured' };
    }

    try {
      const response = await fetch(`${apiUrl}/flight_info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error(`Failed to get flight info for drone ${droneId}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
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
    altitude: number = 50
  ): Promise<DroneApiResponse> {
    const waypoints: DroneWaypoint[] = [
      {
        seq: 0,
        lat: pickupLat,
        lon: pickupLon,
        alt: altitude,
        command: 16 // WAYPOINT
      },
      {
        seq: 1,
        lat: deliveryLat,
        lon: deliveryLon,
        alt: altitude,
        command: 16 // WAYPOINT
      }
    ];

    const mission: DroneMission = {
      filename: `delivery_mission_${droneId}_${Date.now()}.waypoints`,
      altitude_takeoff: altitude,
      waypoints,
      mode: 'auto'
    };

    return await this.createMission(droneId, mission);
  }
  async getMissionCurrent(droneId: number): Promise<{ data?: MissionCurrentPayload; error?: string }> {
  const apiUrl = await this.getDroneApiUrl(droneId);
  if (!apiUrl) {
    return { error: 'Drone API URL not configured' };
  }

  try {
    const res = await fetch(`${apiUrl}/mission/current`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const j = await res.json();
        msg = j?.error || msg;
      } catch { /* ignore */ }
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