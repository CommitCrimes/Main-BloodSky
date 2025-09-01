import { useAuth } from '@/hooks/useAuth';
import pocheSangImage from '@/assets/poche_sang.png';
import DonationCenterUserManagement from '@/components/DonationCenterUserManagement';
import ProfileManagement from '@/components/ProfileManagement';
import HistoryManagement from '@/components/HistoryManagement';
import DashboardLayout from '@/components/DashboardLayout';
import ContactWidgetAuthed from '@/components/SupportItEmailingAuth';
import BloodStockManagement from '@/components/BloodStockManagement';
import type { UserRole, DonationCenterAdminRole } from '@/types/users';

function isDonationCenterAdmin(
  role: UserRole | undefined
): role is DonationCenterAdminRole {
  return role?.type === 'donation_center_admin';
}

const DonationCenterDashboard = () => {
  const auth = useAuth();
  const role = auth.user?.role;

  let centerId: number | undefined;
  if (isDonationCenterAdmin(role)) {
    centerId = role.centerId;
  } else if (role?.type === 'user' && 'centerId' in role) {
    centerId = role.centerId;
  }
  
  const canManageUsers = isDonationCenterAdmin(role) && !!role.admin;

  const dashboardConfig = {
    title: `Bon retour ${auth.user?.userFirstname ?? ''}`,
    subtitle: "Vue d'ensemble de votre centre de donation",
    centerImage: pocheSangImage,
    centerImageAlt: 'Poche de sang Dashboard',
    position: [48.8566, 2.3522] as [number, number],
    chartTitle: 'Livraisons',
    userManagementComponent:
      canManageUsers && centerId ? (
        <DonationCenterUserManagement donationCenterId={centerId} />
      ) : undefined,
    profileManagementComponent: <ProfileManagement />,
    historyManagementComponent: <HistoryManagement />,
    orderBloodComponent: undefined,
    contactComponent: <ContactWidgetAuthed />,
    bloodStockComponent: canManageUsers ? <BloodStockManagement /> : undefined,
  };

  return <DashboardLayout config={dashboardConfig} />;
};

export default DonationCenterDashboard;
