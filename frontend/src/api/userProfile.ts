import { api } from './api';

export interface UserRole {
  type: 'super_admin' | 'hospital_admin' | 'donation_center_admin' | 'dronist' | 'user';
}

export const userProfileApi = {
getUserRole: async (
    userId?: string,
    email?: string,
  ): Promise<UserRole> => {
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (email) params.email = email;

      const response = await api.get<UserRole>('/users/role', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la détermination du rôle:', error);
      return { type: 'user' };
    }
  }
};