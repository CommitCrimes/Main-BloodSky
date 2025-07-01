import { api } from './api';

export interface DonationCenterUser {
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

export interface InviteDonationCenterUserRequest {
  email: string;
  userName: string;
  userFirstname: string;
  telNumber?: number;
  info?: string;
}

export interface UpdateDonationCenterUserRequest {
  userName?: string;
  userFirstname?: string;
  telNumber?: number;
  userStatus?: 'active' | 'suspended' | 'pending';
  info?: string;
}

export interface DonationCenterUsersResponse {
  users: DonationCenterUser[];
  total: number;
}

export const donationCenterAdminApi = {
  getUsers: async (donationCenterId: number): Promise<DonationCenterUsersResponse> => {
    const response = await api.get(`/donation-center-admin/${donationCenterId}/users`);
    return response.data;
  },

  inviteUser: async (donationCenterId: number, userData: InviteDonationCenterUserRequest): Promise<{ message: string; userId: number; email: string }> => {
    const response = await api.post(`/donation-center-admin/${donationCenterId}/users`, userData);
    return response.data;
  },

  updateUser: async (donationCenterId: number, userId: number, userData: UpdateDonationCenterUserRequest): Promise<{ message: string }> => {
    const response = await api.put(`/donation-center-admin/${donationCenterId}/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (donationCenterId: number, userId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/donation-center-admin/${donationCenterId}/users/${userId}`);
    return response.data;
  }
};