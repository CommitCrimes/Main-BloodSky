
/** Identifiants “nommés” (numériques côté DB) */
export type UserId = number;
export type HospitalId = number;
export type CenterId = number;

/** Enregistrement utilisateur de base (table `users`) */
export interface User {
  userId: UserId;
  email: string;
  userName: string;
  userFirstname?: string;
  telNumber?: number;
  userStatus?: string;
}

/** Liaison utilisateur ↔ centre de don (table `user_donation_center`) */
export interface UserDonationCenter {
  userId: UserId;
  centerId: CenterId;
  admin: boolean;
  info?: string;
}

/** Liaison utilisateur ↔ hôpital (table `user_hospital`) */
export interface UserHospital {
  userId: UserId;
  hospitalId: HospitalId;
  admin: boolean;
  info?: string;
}

/** Rôle droniste (table `user_dronist`) */
export interface UserDronist {
  userId: UserId;
  info?: string;
}

/** Rôle “support center” (table `user_support_center`) */
export interface UserSupportCenter {
  userId: UserId;
  info?: string;
}

/** Participation à une livraison (table `delivery_participation`) */
export interface DeliveryParticipation {
  userId: UserId;
}

/** Types de rôles possibles côté front */
export type UserRoleType =
  | 'super_admin'
  | 'hospital_admin'
  | 'donation_center_admin'
  | 'dronist'
  | 'user';

/** Rôle générique déterminé côté front */
export interface UserRoleBase {
  type: UserRoleType;
  info?: string;
  admin?: boolean;
}

export interface SuperAdminRole extends UserRoleBase {
  type: 'super_admin';
}

export interface HospitalAdminRole extends UserRoleBase {
  type: 'hospital_admin';
  hospitalId: HospitalId;
}

export interface DonationCenterAdminRole extends UserRoleBase {
  type: 'donation_center_admin';
  centerId: CenterId;
}

export interface DronistRole extends UserRoleBase {
  type: 'dronist';
}

export interface BasicUserRole extends UserRoleBase {
  type: 'user';
}

/** Union pratique pour affiner via des guards si besoin */
export type UserRole =
  | SuperAdminRole
  | HospitalAdminRole
  | DonationCenterAdminRole
  | DronistRole
  | BasicUserRole;

/** Paramètres de la déduction de rôle côté front */
export interface GetUserRoleParams {
  userId?: string | number;
  email?: string;
}


export const isSuperAdmin = (r: UserRole): r is SuperAdminRole =>
  r.type === 'super_admin';

export const isHospitalAdmin = (r: UserRole): r is HospitalAdminRole =>
  r.type === 'hospital_admin';

export const isDonationCenterAdmin = (r: UserRole): r is DonationCenterAdminRole =>
  r.type === 'donation_center_admin';

export const isDronistRole = (r: UserRole): r is DronistRole =>
  r.type === 'dronist';
