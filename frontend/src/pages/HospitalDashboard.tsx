import { useAuth } from '@/hooks/useAuth';
import coeurImage from '@/assets/coeur_dashboard.png';
import HospitalUserManagement from '@/components/HospitalUserManagement';
import ProfileManagement from '@/components/ProfileManagement';
import HistoryManagement from '@/components/HistoryManagement';
import OrderBlood from '@/components/OrderBlood';
import DashboardLayout from '@/components/DashboardLayout';
import ContactWidgetAuthed from '@/components/SupportItEmailingAuth';
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
    historyManagementComponent: <HistoryManagement />,
    orderBloodComponent: <OrderBlood />,
    contactComponent: <ContactWidgetAuthed />,
  };

  return <DashboardLayout config={dashboardConfig} />;
};

export default HospitalDashboard;