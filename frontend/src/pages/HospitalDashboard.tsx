import { useAuth } from '@/hooks/useAuth';
import coeurImage from '@/assets/coeur_dashboard.png';
import HospitalUserManagement from '@/components/HospitalUserManagement';
import ProfileManagement from '@/components/ProfileManagement';
import DashboardLayout from '@/components/DashboardLayout';

const HospitalDashboard = () => {
  const auth = useAuth();

  // Configuration pour le dashboard hôpital
  const dashboardConfig = {
    title: `Bon retour ${auth.user?.userFirstname}`,
    subtitle: 'Vue d\'ensemble de votre hôpital',
    centerImage: coeurImage,
    centerImageAlt: 'Cœur Dashboard',
    position: [48.8566, 2.3522] as [number, number],
    chartTitle: 'Livraisons',
    userManagementComponent: auth.user?.role?.admin && auth.user?.role?.hospitalId ? (
      <HospitalUserManagement hospitalId={auth.user.role.hospitalId} />
    ) : undefined,
    profileManagementComponent: <ProfileManagement />,
  };

  return <DashboardLayout config={dashboardConfig} />;
};

export default HospitalDashboard;