/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable } from 'mobx';
import { profileApi } from '../api/profile';

export interface Profile {
  userId: string;
  email: string;
  userName: string;
  userFirstname: string;
  telNumber?: number;
  userStatus: 'active' | 'suspended' | 'pending';
  role?: {
    type: 'super_admin' | 'hospital_admin' | 'donation_center_admin' | 'user';
    hospitalId?: number;
    centerId?: number;
    hospitalName?: string;
    centerName?: string;
    hospitalLatitude?: string;
    hospitalLongitude?: string;
    centerLatitude?: string;
    centerLongitude?: string;
    admin?: boolean;
    info?: string;
  };
  dteCreate?: string;
}

export interface UpdateProfileRequest {
  userName?: string;
  userFirstname?: string;
  telNumber?: number;
  info?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateCoordinatesRequest {
  latitude: string;
  longitude: string;
}

class ProfileStore {
  profile: Profile | null = null;
  isLoading = false;
  error: string | null = null;
  isUpdating = false;
  isChangingPassword = false;
  isUpdatingCoordinates = false;

  constructor() {
    makeAutoObservable(this);
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  private setUpdating(updating: boolean) {
    this.isUpdating = updating;
  }

  private setChangingPassword(changing: boolean) {
    this.isChangingPassword = changing;
  }

  private setUpdatingCoordinates(updating: boolean) {
    this.isUpdatingCoordinates = updating;
  }

  private setError(error: string | null) {
    this.error = error;
  }

  private setProfile(profile: Profile | null) {
    this.profile = profile;
  }

  async getMyProfile(): Promise<void> {
    try {
      this.setLoading(true);
      this.setError(null);
      
      const profile = await profileApi.getMyProfile();
      this.setProfile(profile);
    } catch (error: any) {
      this.setError(error.response?.data?.message || 'Erreur lors de la récupération du profil');
      console.error('Erreur getMyProfile:', error);
    } finally {
      this.setLoading(false);
    }
  }

  async updateMyProfile(profileData: UpdateProfileRequest): Promise<boolean> {
    try {
      this.setUpdating(true);
      this.setError(null);
      
      const updatedProfile = await profileApi.updateMyProfile(profileData);
      this.setProfile(updatedProfile);
      return true;
    } catch (error: any) {
      this.setError(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      console.error('Erreur updateMyProfile:', error);
      return false;
    } finally {
      this.setUpdating(false);
    }
  }

  async getProfileById(userId: string): Promise<Profile | null> {
    try {
      this.setLoading(true);
      this.setError(null);
      
      const profile = await profileApi.getProfileById(userId);
      return profile;
    } catch (error: any) {
      this.setError(error.response?.data?.message || 'Erreur lors de la récupération du profil');
      console.error('Erreur getProfileById:', error);
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<boolean> {
    try {
      this.setChangingPassword(true);
      this.setError(null);
      
      await profileApi.changePassword(passwordData);
      return true;
    } catch (error: any) {
      this.setError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
      console.error('Erreur changePassword:', error);
      return false;
    } finally {
      this.setChangingPassword(false);
    }
  }

  clearError() {
    this.setError(null);
  }

  async updateHospitalCoordinates(coordinatesData: UpdateCoordinatesRequest): Promise<boolean> {
    try {
      this.setUpdatingCoordinates(true);
      this.setError(null);
      
      await profileApi.updateHospitalCoordinates(coordinatesData);
      await this.getMyProfile();
      return true;
    } catch (error: any) {
      this.setError(error.response?.data?.message || 'Erreur lors de la mise à jour des coordonnées');
      console.error('Erreur updateHospitalCoordinates:', error);
      return false;
    } finally {
      this.setUpdatingCoordinates(false);
    }
  }

  async updateCenterCoordinates(coordinatesData: UpdateCoordinatesRequest): Promise<boolean> {
    try {
      this.setUpdatingCoordinates(true);
      this.setError(null);
      
      await profileApi.updateCenterCoordinates(coordinatesData);
      await this.getMyProfile();
      return true;
    } catch (error: any) {
      this.setError(error.response?.data?.message || 'Erreur lors de la mise à jour des coordonnées');
      console.error('Erreur updateCenterCoordinates:', error);
      return false;
    } finally {
      this.setUpdatingCoordinates(false);
    }
  }

  reset() {
    this.profile = null;
    this.isLoading = false;
    this.error = null;
    this.isUpdating = false;
    this.isChangingPassword = false;
    this.isUpdatingCoordinates = false;
  }
}

export const profileStore = new ProfileStore();