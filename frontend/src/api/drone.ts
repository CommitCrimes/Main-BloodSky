// src/api/drone.ts
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

/* =========================
 * Types exposés côté front
 * ========================= */

export type Drone = {
  droneId: number;
  droneName: string;
  centerId: number | null;
  droneImage?: string | null;
  droneStatus?: string | null;
};

export type DroneUpdate = Partial<Pick<Drone, "droneName" | "centerId" | "droneImage" | "droneStatus">>;

export type FlightInfo = {
  drone_id: string;
  is_armed: boolean;
  flight_mode: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  horizontal_speed_m_s: number;
  vertical_speed_m_s: number; // ⚠️ harmonisé
  heading_deg: number;
  movement_track_deg: number;
  battery_remaining_percent: number;
};

export type DroneWaypoint = {
  seq?: number;
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
};

export type DroneMission = {
  filename: string;
  altitude_takeoff: number;
  mode: "auto" | "man";
  waypoints: DroneWaypoint[];
};

export type DeliveryMissionParams = {
  pickupLat: number;
  pickupLon: number;
  deliveryLat: number;
  deliveryLon: number;
  altitude: number;
};

export type CommandMode =
  | "RTL"
  | "AUTO"
  | "GUIDED"
  | "LOITER"
  | "LAND"
  | "POSHOLD"
  | "STABILIZE"
  | "ALT_HOLD"
  | "RETURN"
  | string;

// /drones/status → structure renvoyée par droneSyncService.getDronesStatus()
// (garde `any` si tu ne connais pas la forme exacte)
export type DronesStatus = unknown;

// /drones/history → jointure drones + deliveries + hospitals + centers
export type DroneHistoryItem = {
  droneId: number;
  droneName: string | null;
  droneStatus: string | null;
  droneImage: string | null;

  // Delivery
  deliveryId: number | null;
  deliveryStatus: string | null;
  deliveryUrgent: number | boolean | null;
  dteDelivery: string | null;
  dteValidation: string | null;

  // Hospital
  hospitalName: string | null;
  hospitalCity: string | null;

  // Center
  centerCity: string | null;
};

// ⛔️ Drones de test à ignorer côté UI
const IGNORE_DRONE_IDS = new Set<number>([2]);

function filterDrones<T extends { droneId?: number }>(arr: T[]): T[] {
  return arr.filter(d => !(typeof d?.droneId === 'number' && IGNORE_DRONE_IDS.has(d.droneId)));
}

/* =========================
 * Helper HTTP minimaliste
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
    fetchJson<string>("/drones", { method: "POST", body: JSON.stringify(data) }),

  /** PUT /drones/:id */
  update: (id: number, patch: DroneUpdate) =>
    fetchJson<string>(`/drones/${id}`, { method: "PUT", body: JSON.stringify(patch) }),

  /** DELETE /drones/:id */
  remove: (id: number) => fetchJson<string>(`/drones/${id}`, { method: "DELETE" }),

  // --- Sync / Telemetry ---

  /** POST /drones/:id/sync */
  sync: (id: number) => fetchJson<{ message: string }>(`/drones/${id}/sync`, { method: "POST" }),

  /** GET /drones/:id/flight_info */
  getFlightInfo: (id: number) => fetchJson<FlightInfo>(`/drones/${id}/flight_info`),

  // --- Missions ---

  /** POST /drones/:id/mission/create */
  createMission: (id: number, mission: DroneMission) =>
    fetchJson(`/drones/${id}/mission/create`, {
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
};
