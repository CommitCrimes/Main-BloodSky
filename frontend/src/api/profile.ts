import type { Profile, UpdateProfileRequest, ChangePasswordRequest, UpdateCoordinatesRequest } from '@/stores/profileStore';
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
  },

  updateHospitalCoordinates: async (coordinatesData: UpdateCoordinatesRequest): Promise<void> => {
    await api.put('/users/profile/hospital/coordinates', coordinatesData);
  },

  updateCenterCoordinates: async (coordinatesData: UpdateCoordinatesRequest): Promise<void> => {
    await api.put('/users/profile/center/coordinates', coordinatesData);
  }
};