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
      const availableDrones = await db
        .select()
        .from(drones);

      // For now, sync all drones using the fixed API URL
      const syncPromises = availableDrones.map(drone => 
        this.syncDrone(drone.droneId, 'http://localhost:5000', drone.droneId)
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
   * Update drone record with sync timestamp
   * Flight info is now retrieved in real-time, no need to store it
   */
  private async updateDroneFromFlightInfo(droneId: number, flightInfo: DroneFlightInfo): Promise<void> {
    // Only update sync timestamp and status
    const updateData = {
      droneStatus: flightInfo.is_armed ? 'armed' : 'available'
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
      isOnline: true, // Always consider online since we use real-time API
      lastSyncAt: new Date() // Current time as we sync on-demand
    }));
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

      if (drone.length === 0) {
        return false;
      }

      await this.syncDrone(droneId, 'http://localhost:5000', droneId);
      return true;
    } catch (error) {
      console.error(`Force sync failed for drone ${droneId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const droneSyncService = DroneSyncService.getInstance();