import { useAuth } from '@/hooks/useAuth';
import coeurImage from '@/assets/coeur_dashboard.png';
import HospitalUserManagement from '@/components/HospitalUserManagement';
import ProfileManagement from '@/components/ProfileManagement';
import HistoryManagement from '@/components/HistoryManagement';
import OrderBlood from '@/components/OrderBlood';
import DashboardLayout from '@/components/DashboardLayout';
import ContactWidgetAuthed from '@/components/SupportItEmailingAuth';
import type { UserRole, HospitalAdminRole } from '@/types/users';

function isHospitalAdmin(
  role: UserRole | undefined
): role is HospitalAdminRole {
  return role?.type === 'hospital_admin';
}

const HospitalDashboard = () => {
  const auth = useAuth();
  const role = auth.user?.role;

  const hospitalId = isHospitalAdmin(role) ? role.hospitalId : undefined;
  const canManageUsers = isHospitalAdmin(role) && !!role.admin;

  const dashboardConfig = {
    title: `Bon retour ${auth.user?.userFirstname ?? ''}`,
    subtitle: "Vue d'ensemble de votre hôpital",
    centerImage: coeurImage,
    centerImageAlt: 'Cœur Dashboard',
    position: [48.8566, 2.3522] as [number, number],
    chartTitle: 'Livraisons',
    userManagementComponent:
      canManageUsers && hospitalId ? (
        <HospitalUserManagement hospitalId={hospitalId} />
      ) : undefined,
    profileManagementComponent: <ProfileManagement />,
    historyManagementComponent: <HistoryManagement />,
    orderBloodComponent: <OrderBlood />,
    contactComponent: <ContactWidgetAuthed />,
  };

  return <DashboardLayout config={dashboardConfig} />;
};

export default HospitalDashboard;
