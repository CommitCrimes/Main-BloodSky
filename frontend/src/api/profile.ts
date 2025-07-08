import type { Profile, UpdateProfileRequest, ChangePasswordRequest } from '@/stores/profileStore';
import { api } from './api';

export const profileApi = {
  getMyProfile: async (): Promise<Profile> => {
    const response = await api.get('/users/profile/me');
    return response.data;
  },

  updateMyProfile: async (profileData: UpdateProfileRequest): Promise<Profile> => {
    const response = await api.put('/users/profile/me', profileData);
    return response.data;
  },

  getProfileById: async (userId: string): Promise<Profile> => {
    const response = await api.get(`/users/profile/${userId}`);
    return response.data;
  },

  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    await api.put('/users/profile/change-password', passwordData);
  }
};