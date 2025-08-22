import { db } from '../utils/db';
import { drones } from '../schemas/drone';
import { eq } from 'drizzle-orm';
import type { DroneFlightInfo, DroneStatus } from '../types/drone.types';

export class DroneSyncService {
  private static instance: DroneSyncService;

  private syncInterval: NodeJS.Timeout | null = null;

  // --- Constantes SANS .env ---
  private readonly API_BASE = 'http://localhost:5000';
  private readonly SYNC_ENABLED = true; // mets false si tu veux couper le poller
  private readonly SYNC_INTERVAL_MS = 5000; // 5s

  // Mémoire pour limiter les writes et exposer lastSyncAt
  private lastStatus = new Map<number, string>();
  private lastSyncAt = new Map<number, Date>();
  private lastErrorLogAt = 0; // anti-spam logs (ms epoch)

  private constructor() {}

  static getInstance(): DroneSyncService {
    if (!DroneSyncService.instance) {
      DroneSyncService.instance = new DroneSyncService();
    }
    return DroneSyncService.instance;
  }
  startSync(): void {
    if (!this.SYNC_ENABLED) {
      console.log('Drone sync disabled (SYNC_ENABLED=false)');
      return;
    }
    if (this.syncInterval) {
      console.log('Drone sync already running');
      return;
    }
    console.log(`Starting drone sync (base=${this.API_BASE}) every ${this.SYNC_INTERVAL_MS}ms`);
    this.syncInterval = setInterval(async () => {
      await this.syncAllDrones();
    }, this.SYNC_INTERVAL_MS);
  }

  /** Stop le poller */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Drone sync service stopped');
    }
  }

  /** Sync tous les drones */
  async syncAllDrones(): Promise<void> {
    try {
      const availableDrones = await db.select().from(drones);
      await Promise.allSettled(
        availableDrones.map(d => this.syncDrone(d.droneId, this.API_BASE, d.droneId))
      );
    } catch (error) {
      console.error('Error syncing drones:', error);
    }
  }

  /** Sync un drone */
async syncDrone(droneId: number, apiUrl: string, apiId?: number | null): Promise<void> {
  try {
    const flightInfo = await this.fetchFlightInfo(apiUrl, apiId ?? droneId /*, true */); // true => strict si tu veux
    const now = new Date();

    if (!flightInfo) {
      this.lastStatus.set(droneId, 'hors service');
      this.lastSyncAt.set(droneId, now);
      return;
    }

    const status = flightInfo.is_armed === true ? 'active' : 'ready';
    this.lastStatus.set(droneId, status);
    this.lastSyncAt.set(droneId, now);
  } catch (error) {
    console.error(`Error syncing drone ${droneId}:`, error);
    const now = new Date();
    this.lastStatus.set(droneId, 'hors service');
    this.lastSyncAt.set(droneId, now);
  }
}


  /** Récupère la télémétrie */
private async fetchFlightInfo(apiUrl: string, droneId: number, strict = false): Promise<DroneFlightInfo | null> {
  try {
    const url = `${apiUrl}/drones/${droneId}/flight_info${strict ? '?strict=1' : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as DroneFlightInfo;
  } catch (error) {
    const now = Date.now();
    if (now - this.lastErrorLogAt > 15000) {
      console.warn(`[sync] /drones/${droneId}/flight_info unreachable: ${(error as Error).message}`);
      this.lastErrorLogAt = now;
    }
    return null;
  }
}


  /** Expose un statut "online/offline" + lastSyncAt */
  async getDronesStatus(): Promise<DroneStatus[]> {
    const all = await db.select().from(drones);

    return all.map(drone => {
      const status =
        this.lastStatus.get(drone.droneId) ??
        (drone as any).droneStatus ??
        'unknown';
      const isOnline = !['hors service', 'offline'].includes(String(status).toLowerCase());
      const last = this.lastSyncAt.get(drone.droneId) ?? new Date();

      return {
        droneId: drone.droneId,
        isOnline,
        lastSyncAt: last,
      };
    });
  }

  /** Sync forcée d’un drone */
  async forceSyncDrone(droneId: number): Promise<boolean> {
    try {
      const drone = await db
        .select()
        .from(drones)
        .where(eq(drones.droneId, droneId))
        .limit(1);

      if (drone.length === 0) return false;

      await this.syncDrone(droneId, this.API_BASE, droneId);
      return true;
    } catch (error) {
      console.error(`Force sync failed for drone ${droneId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const droneSyncService = DroneSyncService.getInstance();
