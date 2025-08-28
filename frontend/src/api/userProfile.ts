import { api } from './api';
import { type UserRole } from '@/types/users';

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
      return { type: 'user' } as UserRole;
    }
  }
};