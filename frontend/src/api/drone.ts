// src/api/drone.ts
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
import type{
  Drone, DroneUpdate, DroneHistoryItem, DronesStatus,
  FlightInfo, DroneMission, CommandMode,
  DeliveryMissionParams, CreateMissionResponse,DroneWaypoint,
  MissionsList
} from '@/types/drone';
export type MissionCurrent = {
  count: number;
  items: DroneWaypoint[];
};

const IGNORE_DRONE_IDS = new Set<number>([0]);

function filterDrones<T extends { droneId?: number }>(arr: T[]): T[] {
  return arr.filter(d => !(typeof d?.droneId === 'number' && IGNORE_DRONE_IDS.has(d.droneId)));
}

/* =========================
 * Helper HTTP 
 * ========================= */

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(init?.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json() as { error?: string; message?: string };
      message = data?.error || data?.message || message;
    } catch {
      // ignore
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

/* =========================
 * Client API Drones (front)
 * ========================= */

export const dronesApi = {
  // --- CRUD / listings ---

  /** GET /drones */
  list: async () => filterDrones(await fetchJson<Drone[]>("/drones")),

  /** GET /drones/status */
  getStatus: async () => {
    const status = await fetchJson<DronesStatus>("/drones/status");
    // Si c'est un tableau d'objets ayant droneId, on filtre; sinon on renvoie tel quel
    if (Array.isArray(status)) {
      return status.filter((s: { droneId?: number }) => !(s && typeof s.droneId === 'number' && IGNORE_DRONE_IDS.has(s.droneId)));
    }
    return status;
  },

  /** GET /drones/history */
  getHistory: async () => {
    const rows = await fetchJson<DroneHistoryItem[]>("/drones/history");
    return rows.filter(r => !(typeof r?.droneId === 'number' && IGNORE_DRONE_IDS.has(r.droneId)));
  },

  /** GET /drones/center/:centerId */
  getByCenter: async (centerId: number) =>
    filterDrones(await fetchJson<Drone[]>(`/drones/center/${centerId}`)),

  /** GET /drones/:id */
  getById: (id: number) => fetchJson<Drone>(`/drones/${id}`),

  /** POST /drones */
  create: (data: Omit<Drone, "droneId">) =>
    fetchJson<{ message: string; droneId: number }>(
      "/drones",
      { method: "POST", body: JSON.stringify(data) }
    ),

  /** PUT /drones/:id */
  update: async (id: number, patch: DroneUpdate) => {
    const res = await fetch(`${BASE}/drones/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return;
  },

  /** DELETE /drones/:id */
  remove: (id: number) => fetchJson<string>(`/drones/${id}`, { method: "DELETE" }),

  // --- Sync / Telemetry ---

  /** POST /drones/:id/sync */
  sync: (id: number) => fetchJson<{ message: string }>(`/drones/${id}/sync`, { method: "POST" }),

  /** GET /drones/missions */
  listMissions: (params?: {
    ext?: string;                 
    recursive?: boolean;   
    sort?: "name" | "size" | "mtime";
    order?: "asc" | "desc";
    limit?: number;
  }) => {
    const qs = params
      ? `?${new URLSearchParams({
          ...(params.ext ? { ext: params.ext } : {}),
          ...(params.recursive !== undefined ? { recursive: String(params.recursive) } : {}),
          ...(params.sort ? { sort: params.sort } : {}),
          ...(params.order ? { order: params.order } : {}),
          ...(params.limit !== undefined ? { limit: String(params.limit) } : {}),
        }).toString()}`
      : "";
    return fetchJson<MissionsList>(`/drones/missions${qs}`);
  },

  /** GET /drones/:id/flight_info */
  getFlightInfo: (id: number) => fetchJson<FlightInfo>(`/drones/${id}/flight_info`),

  // --- Missions ---

  /** POST /drones/:id/mission/create */
  createMission: (id: number, mission: DroneMission) =>
    fetchJson<CreateMissionResponse>(`/drones/${id}/mission/create`, {
      method: "POST",
      body: JSON.stringify(mission),
    }),

  /** POST /drones/:id/mission/start */
  startMission: (id: number) =>
    fetchJson(`/drones/${id}/mission/start`, {
      method: "POST",
    }),

  /** POST /drones/:id/mission/modify */
  modifyMission: (
    id: number,
    params: { filename: string; seq: number; updates: { lat: number; lon: number; alt: number } }
  ) =>
    fetchJson(`/drones/${id}/mission/modify`, {
      method: "POST",
      body: JSON.stringify(params),
    }),
    /** POST /drones/:id/mission/send (JSON avec filename) */
    sendMissionFile: (id: number, filename: string) => {
      return fetchJson(`/drones/${id}/mission/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
    },



  /** POST /drones/:id/delivery-mission */
  createDeliveryMission: (id: number, p: DeliveryMissionParams) =>
    fetchJson(`/drones/${id}/delivery-mission`, {
      method: "POST",
      body: JSON.stringify(p),
    }),

  // --- Commandes de vol ---

  /** POST /drones/:id/command { mode } */
  command: (id: number, mode: CommandMode) =>
    fetchJson<{ message?: string }>(`/drones/${id}/command`, {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),

  /** Return to home via changement de mode RTL (préféré) */
  returnHome: (id: number) => dronesApi.command(id, "RTL"),

  /** (Optionnel) Return to home via endpoint dédié back */
  returnHomeViaEndpoint: (id: number) =>
    fetchJson(`/drones/${id}/return-home`, { method: "POST" }),
  /** GET /drones/:id/mission/current */
  getMissionCurrent: (id: number) =>
    fetchJson<MissionCurrent>(`/drones/${id}/mission/current`),
};
