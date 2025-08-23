// src/api/users.ts
// Front API pour vos routes Hono (/users/...)
// - utilise fetch
// - pas de "any"
// - BASE_URL via VITE_API_BASE_URL

import type {
  User,
  UserDonationCenter,
  UserHospital,
  UserDronist,
  UserSupportCenter,
  DeliveryParticipation,
  UserRole,
  GetUserRoleParams,
} from '@/types/users';

const RAW_BASE =
  typeof import.meta !== 'undefined' &&
  (import.meta as ImportMeta).env &&
  (import.meta as ImportMeta).env.VITE_API_BASE_URL
    ? (import.meta as ImportMeta).env.VITE_API_BASE_URL
    : '';

const BASE_URL = RAW_BASE.replace(/\/$/, '');

class HttpError extends Error {
  readonly status: number;
  readonly body?: string;
  constructor(status: number, statusText: string, body?: string) {
    super(`HTTP ${status} ${statusText}`);
    this.status = status;
    this.body = body;
  }
}

type ExpectMode = 'json' | 'text' | 'void';

type ReqInit = Omit<RequestInit, 'headers' | 'body'> & {
  headers?: Record<string, string>;
  body?: string;
  expect?: ExpectMode;
};

function buildUrl(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function request<T = unknown>(path: string, init?: ReqInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => undefined);
    throw new HttpError(res.status, res.statusText, body);
  }

  const mode: ExpectMode = init?.expect ?? 'json';
  if (mode === 'void' || res.status === 204) {
    return undefined as T;
  }
  if (mode === 'text') {
    return (await res.text()) as T;
  }
  const txt = await res.text();
  return (txt ? JSON.parse(txt) : null) as T;
}

// Helpers “safe” (404 → valeur neutre)
async function safeGetArray<T>(path: string): Promise<T[]> {
  try {
    const data = await request<T[]>(path);
    return Array.isArray(data) ? data : [];
  } catch (err: unknown) {
    if (err instanceof HttpError && err.status === 404) return [];
    throw err;
  }
}

async function safeGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await request<T>(path);
  } catch (err: unknown) {
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
}

/* ========= API ========= */
export const usersApi = {
  // --- GET de base ---
  list: () => request<User[]>('/users'),

  getById: (id: number) => safeGetOrNull<User>(`/users/${id}`),

  getByEmail: (email: string) =>
    safeGetOrNull<User>(`/users/email/${encodeURIComponent(email)}`),

  getByName: (name: string) =>
    safeGetOrNull<User>(`/users/name/${encodeURIComponent(name)}`),

  // --- Tables “rôles” ---
  listDonationCenterUsers: () =>
    request<UserDonationCenter[]>('/users/donation-center'),

  listDronists: () => request<UserDronist[]>('/users/dronist'),

  listSupportCenterUsers: () =>
    request<UserSupportCenter[]>('/users/support-center'),

  listHospitalUsers: () => request<UserHospital[]>('/users/hospital'),

  getDonationCenterUsersByCenter: (centerId: number) =>
    safeGetArray<UserDonationCenter>(`/users/donation-center/${centerId}`),

  getHospitalUsersByHospital: (hospitalId: number) =>
    safeGetArray<UserHospital>(`/users/hospital/${hospitalId}`),

  getDonationCenterAdmins: (centerId: number) =>
    safeGetArray<UserDonationCenter>(
      `/users/donation-center/${centerId}/admins`,
    ),

  getHospitalAdmins: (hospitalId: number) =>
    safeGetArray<UserHospital>(`/users/hospital/${hospitalId}/admins`),

  // --- Livraisons par user ---
  getUserDeliveries: (userId: number) =>
    request<DeliveryParticipation[]>(`/users/${userId}/deliveries`),

  // --- Rôle utilisateur ---
  getUserRole: async (params?: GetUserRoleParams): Promise<UserRole> => {
    // super admin par email
    if (params?.email === 'admin@bloodsky.fr') {
      return { type: 'super_admin' };
    }

    const userIdNum =
      typeof params?.userId === 'string'
        ? Number(params.userId)
        : typeof params?.userId === 'number'
        ? params.userId
        : NaN;

    if (!userIdNum || Number.isNaN(userIdNum)) {
      throw new Error('userId est requis pour déterminer le rôle');
    }

    // Tentative endpoint dédié
    try {
      const role = await request<UserRole>('/users/role', { method: 'GET' });
      if (role && role.type) return role;
    } catch {
      // ignore → on passe au fallback
    }

    // Fallback tables
    const [hosp, dons, dron] = await Promise.all([
      safeGetArray<UserHospital>('/users/hospital'),
      safeGetArray<UserDonationCenter>('/users/donation-center'),
      safeGetArray<UserDronist>('/users/dronist'),
    ]);

    const h = hosp.find((x) => x.userId === userIdNum);
    if (h) {
      return {
        type: 'hospital_admin',
        hospitalId: h.hospitalId,
        admin: h.admin,
        info: h.info,
      };
    }

    const d = dons.find((x) => x.userId === userIdNum);
    if (d) {
      return {
        type: 'donation_center_admin',
        centerId: d.centerId,
        admin: d.admin,
        info: d.info,
      };
    }

    const dr = dron.find((x) => x.userId === userIdNum);
    if (dr) {
      return { type: 'dronist', info: dr.info };
    }

    return { type: 'user' };
  },

  // --- Créations ---
  createUser: (user: Partial<User>) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(user) }),

  createUserInDonationCenter: (payload: {
    user: Partial<User>;
    centerId: number;
    admin?: boolean;
    info?: string;
  }) =>
    request<string>('/users/donation-center', {
      method: 'POST',
      body: JSON.stringify(payload),
      expect: 'text',
    }),

  createUserInHospital: (payload: {
    user: Partial<User>;
    hospitalId: number;
    admin?: boolean;
    info?: string;
  }) =>
    request<string>('/users/hospital', {
      method: 'POST',
      body: JSON.stringify(payload),
      expect: 'text',
    }),

  createDronist: (payload: { user: Partial<User>; info?: string }) =>
    request<string>('/users/dronist', {
      method: 'POST',
      body: JSON.stringify(payload),
      expect: 'text',
    }),

  createSupportCenterUser: (payload: { user: Partial<User>; info?: string }) =>
    request<string>('/users/support-center', {
      method: 'POST',
      body: JSON.stringify(payload),
      expect: 'text',
    }),

  // --- Updates ---
  updateUser: (id: number, user: Partial<User>) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),

  updateDonationCenterUser: (
    id: number,
    payload: { user?: Partial<User>; centerId: number; admin?: boolean; info?: string },
  ) =>
    request<string>(`/users/donation-center/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      expect: 'text',
    }),

  updateHospitalUser: (
    id: number,
    payload: { user?: Partial<User>; hospitalId: number; admin?: boolean; info?: string },
  ) =>
    request<string>(`/users/hospital/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      expect: 'text',
    }),

  updateDronistUser: (id: number, payload: { user?: Partial<User>; info?: string }) =>
    request<string>(`/users/dronist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      expect: 'text',
    }),

  updateSupportCenterUser: (id: number, payload: { user?: Partial<User>; info?: string }) =>
    request<string>(`/users/support-center/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      expect: 'text',
    }),

  // --- Delete ---
  deleteUser: (id: number) =>
    request<string>(`/users/${id}`, { method: 'DELETE', expect: 'text' }),
};

// Petit helper côté UI (optionnel)
export const isDronist = async (params: GetUserRoleParams): Promise<boolean> => {
  const role = await usersApi.getUserRole(params);
  return role.type === 'dronist' || role.type === 'super_admin';
};
