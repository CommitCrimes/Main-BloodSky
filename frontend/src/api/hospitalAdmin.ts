import { api } from './api';

export interface HospitalUser {
  userId: number;
  email: string;
  userName: string;
  userFirstname: string;
  telNumber?: number;
  userStatus: 'active' | 'suspended' | 'pending';
  dteCreate: string;
  info?: string;
  admin: boolean;
}

export interface InviteHospitalUserRequest {
  email: string;
  userName: string;
  userFirstname: string;
  telNumber?: number;
  info?: string;
}

export interface UpdateHospitalUserRequest {
  userName?: string;
  userFirstname?: string;
  telNumber?: number;
  userStatus?: 'active' | 'suspended' | 'pending';
  info?: string;
}

export interface HospitalUsersResponse {
  users: HospitalUser[];
  total: number;
}

export const hospitalAdminApi = {
  getUsers: async (hospitalId: number): Promise<HospitalUsersResponse> => {
    const response = await api.get(`/hospital-admin/${hospitalId}/users`);
    return response.data;
  },

  inviteUser: async (hospitalId: number, userData: InviteHospitalUserRequest): Promise<{ message: string; userId: number; email: string }> => {
    const response = await api.post(`/hospital-admin/${hospitalId}/users`, userData);
    return response.data;
  },

  updateUser: async (hospitalId: number, userId: number, userData: UpdateHospitalUserRequest): Promise<{ message: string }> => {
    const response = await api.put(`/hospital-admin/${hospitalId}/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (hospitalId: number, userId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/hospital-admin/${hospitalId}/users/${userId}`);
    return response.data;
  }
};