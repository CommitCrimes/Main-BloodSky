import { useAuth } from '@/hooks/useAuth';
import pocheSangImage from '@/assets/poche_sang.png';
import DonationCenterUserManagement from '@/components/DonationCenterUserManagement';
import ProfileManagement from '@/components/ProfileManagement';
import HistoryManagement from '@/components/HistoryManagement';
import DashboardLayout from '@/components/DashboardLayout';

const DonationCenterDashboard = () => {
  const auth = useAuth();

  // Configuration pour le dashboard centre de donation
  const dashboardConfig = {
    title: `Bon retour ${auth.user?.userFirstname}`,
    subtitle: 'Vue d\'ensemble de votre centre de donation',
    centerImage: pocheSangImage,
    centerImageAlt: 'Poche de Sang Dashboard',
    position: [48.8566, 2.3522] as [number, number],
    chartTitle: 'Collections',
    userManagementComponent: auth.user?.role?.admin && auth.user?.role?.centerId ? (
      <DonationCenterUserManagement donationCenterId={auth.user.role.centerId} />
    ) : undefined,
    profileManagementComponent: <ProfileManagement />,
    historyManagementComponent: <HistoryManagement />,
  };

  return <DashboardLayout config={dashboardConfig} />;
};

export default DonationCenterDashboard;