import { db } from '../utils/db';
import { drones } from '../schemas/drone';
import { eq, isNotNull } from 'drizzle-orm';
import { DroneFlightInfo, DroneUpdate, DroneStatus } from '../types/drone.types';

export class DroneSyncService {
  private static instance: DroneSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 5000; // 5 seconds

  private constructor() {}

  static getInstance(): DroneSyncService {
    if (!DroneSyncService.instance) {
      DroneSyncService.instance = new DroneSyncService();
    }
    return DroneSyncService.instance;
  }

  /**
   * Start periodic synchronization of all drones with API URLs
   */
  startSync(): void {
    if (this.syncInterval) {
      console.log('Drone sync already running');
      return;
    }

    console.log('Starting drone synchronization service...');
    this.syncInterval = setInterval(async () => {
      await this.syncAllDrones();
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop periodic synchronization
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Drone sync service stopped');
    }
  }

  /**
   * Sync all drones that have API URLs configured
   */
  async syncAllDrones(): Promise<void> {
    try {
      const dronesWithApi = await db
        .select()
        .from(drones)
        .where(isNotNull(drones.droneApiUrl));

      const syncPromises = dronesWithApi.map(drone => 
        this.syncDrone(drone.droneId, drone.droneApiUrl!, drone.droneApiId)
      );

      await Promise.allSettled(syncPromises);
    } catch (error) {
      console.error('Error syncing drones:', error);
    }
  }

  /**
   * Sync a single drone with its API
   */
  async syncDrone(droneId: number, apiUrl: string, apiId?: number | null): Promise<void> {
    try {
      const flightInfo = await this.fetchFlightInfo(apiUrl, apiId);
      if (flightInfo) {
        await this.updateDroneFromFlightInfo(droneId, flightInfo);
      }
    } catch (error) {
      console.error(`Error syncing drone ${droneId}:`, error);
    }
  }

  /**
   * Fetch flight info from drone API
   */
  private async fetchFlightInfo(apiUrl: string, apiId?: number | null): Promise<DroneFlightInfo | null> {
    try {
      const response = await fetch(`${apiUrl}/flight_info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as DroneFlightInfo;
    } catch (error) {
      console.error(`Failed to fetch flight info from ${apiUrl}:`, error);
      return null;
    }
  }

  /**
   * Update drone record with flight info
   */
  private async updateDroneFromFlightInfo(droneId: number, flightInfo: DroneFlightInfo): Promise<void> {
    const updateData = {
      droneCurrentLat: String(flightInfo.latitude),
      droneCurrentLong: String(flightInfo.longitude),
      altitudeM: String(flightInfo.altitude_m),
      horizontalSpeedMS: String(flightInfo.horizontal_speed_m_s),
      verticalSpeedMS: String(flightInfo.vertical_speed_m_s),
      headingDeg: String(flightInfo.heading_deg),
      flightMode: flightInfo.flight_mode,
      isArmed: flightInfo.is_armed,
      lastSyncAt: new Date(),
      updatedAt: new Date()
    };

    await db
      .update(drones)
      .set(updateData)
      .where(eq(drones.droneId, droneId));
  }

  /**
   * Get sync status of all drones
   */
  async getDronesStatus(): Promise<DroneStatus[]> {
    const allDrones = await db.select().from(drones);
    
    return allDrones.map(drone => ({
      droneId: drone.droneId,
      isOnline: this.isDroneOnline(drone.lastSyncAt),
      lastSyncAt: drone.lastSyncAt,
      apiUrl: drone.droneApiUrl,
      apiId: drone.droneApiId
    }));
  }

  /**
   * Check if drone is considered online based on last sync
   */
  private isDroneOnline(lastSyncAt: Date | null): boolean {
    if (!lastSyncAt) return false;
    
    const now = new Date();
    const timeDiff = now.getTime() - lastSyncAt.getTime();
    const ONLINE_THRESHOLD_MS = 15000; // 15 seconds
    
    return timeDiff < ONLINE_THRESHOLD_MS;
  }

  /**
   * Force sync a specific drone
   */
  async forceSyncDrone(droneId: number): Promise<boolean> {
    try {
      const drone = await db
        .select()
        .from(drones)
        .where(eq(drones.droneId, droneId))
        .limit(1);

      if (drone.length === 0 || !drone[0].droneApiUrl) {
        return false;
      }

      await this.syncDrone(droneId, drone[0].droneApiUrl, drone[0].droneApiId);
      return true;
    } catch (error) {
      console.error(`Force sync failed for drone ${droneId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const droneSyncService = DroneSyncService.getInstance();