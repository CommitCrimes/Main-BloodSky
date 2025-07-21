import { api } from './api';

export interface UserRole {
  type: 'super_admin' | 'hospital_admin' | 'donation_center_admin' | 'dronist' | 'user';
  hospitalId?: number;
  centerId?: number;
  admin?: boolean;
  info?: string;
}

interface GetUserRoleParams {
  userId?: string;
  email?: string;
}

interface UserHospitalRecord {
  userId: number;
  hospitalId: number;
  admin: boolean;
  info?: string;
}

interface UserDonationCenterRecord {
  userId: number;
  centerId: number;
  admin: boolean;
  info?: string;
}

interface UserDronistRecord {
  userId: number;
  info?: string;
}

export const userProfileApi = {
  getUserRole: async (params?: GetUserRoleParams): Promise<UserRole> => {
    // Vérifier d'abord si c'est le super admin par email
    if (params?.email === 'admin@bloodsky.fr') {
      return { type: 'super_admin' };
    }
    
    if (!params?.userId) {
      throw new Error('userId est requis pour déterminer le rôle');
    }
    
    try {
      const userIdNumber = parseInt(params.userId);
      
      // Vérifier dans user_hospital
      const hospitalResponse = await api.get(`/users/hospital`);
      const hospitalUsers: UserHospitalRecord[] = hospitalResponse.data || [];
      const hospitalUser = hospitalUsers.find((u) => u.userId === userIdNumber);
      
      if (hospitalUser) {
        return {
          type: 'hospital_admin',
          hospitalId: hospitalUser.hospitalId,
          admin: hospitalUser.admin,
          info: hospitalUser.info
        };
      }
      
      // Vérifier dans user_donation_center
      const donationResponse = await api.get(`/users/donation-center`);
      const donationUsers: UserDonationCenterRecord[] = donationResponse.data || [];
      const donationUser = donationUsers.find((u) => u.userId === userIdNumber);
      
      if (donationUser) {
        return {
          type: 'donation_center_admin',
          centerId: donationUser.centerId,
          admin: donationUser.admin,
          info: donationUser.info
        };
      }
      
      // Vérifier dans user_dronist
      const dronistResponse = await api.get(`/users/dronist`);
      const dronistUsers: UserDronistRecord[] = dronistResponse.data || [];
      const dronistUser = dronistUsers.find((u) => u.userId === userIdNumber);
      
      if (dronistUser) {
        return {
          type: 'dronist',
          info: dronistUser.info
        };
      }
      
      // Si aucun rôle trouvé utilisateur lambda
      return { type: 'user' };
      
    } catch (error) {
      console.error('Erreur lors de la détermination du rôle:', error);
      //utilisateur normal par défaut
      return { type: 'user' };
    }
  }
};