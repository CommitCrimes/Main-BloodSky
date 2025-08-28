import { useAuth } from '@/hooks/useAuth';
import adminImage from '@/assets/logo.png';
import DashboardLayout from '@/components/DashboardLayout';
import SuperAdminDashboardContent from '@/components/SuperAdminDashboardContent';
import SuperAdminInviteForm from '@/components/SuperAdminInviteForm';
import SuperAdminDeliveryManagement from '@/components/SuperAdminDeliveryManagement';
import SuperAdminStatistics from '@/components/SuperAdminStatistics';
import SuperAdminDroneManagement from '@/components/SuperAdminDroneManagement';
import SuperAdminHospitalManagement from '@/components/SuperAdminHospitalManagement';
import SuperAdminCenterManagement from '@/components/SuperAdminCenterManagement';
import SuperAdminAdminManagement from '@/components/SuperAdminAdminManagement';
import SearchBar from '@/components/SearchBar';
import ContactWidgetAuthed from '@/components/SupportItEmailingAuth';
import {
  DashboardOutlined,
  GroupAddOutlined,
  LocalHospitalOutlined,
  BusinessOutlined,
  ContactSupportOutlined,
  FlightTakeoffOutlined,
  LocalShippingOutlined,
} from '@mui/icons-material';

const SuperAdminDashboard = () => {
  const auth = useAuth();

  // Configuration spécifique pour le dashboard super admin
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
    { id: 'admins', label: 'Gestion Admins', icon: <GroupAddOutlined /> },
    { id: 'drones', label: 'Gestion Drones', icon: <FlightTakeoffOutlined /> },
    { id: 'hospitals', label: 'Gestion Hôpitaux', icon: <LocalHospitalOutlined /> },
    { id: 'centers', label: 'Gestion Centres', icon: <BusinessOutlined /> },
    { id: 'deliveries', label: 'Gestion Livraisons', icon: <LocalShippingOutlined /> },
    { id: 'contact', label: 'Contact', icon: <ContactSupportOutlined /> },
  ];

  const dashboardConfig = {
    title: `Bienvenue ${auth.user?.userFirstname}`,
    subtitle: 'Administration générale du système BloodSky',
    centerImage: adminImage,
    centerImageAlt: 'Admin Dashboard',
    position: [47.2098952, -1.5513221] as [number, number],
    chartTitle: 'Aperçu système',
    menuItems: menuItems,
    customDashboardComponent: (setActiveView: (view: string) => void) => (
      <SuperAdminDashboardContent onNavigate={setActiveView} />
    ),
    contactComponent: <ContactWidgetAuthed />,
    // Composants pour les autres vues
    dronesComponent: <SuperAdminDroneManagement />,
    hospitalsComponent: <SuperAdminHospitalManagement />,
    centersComponent: <SuperAdminCenterManagement />,
    adminsComponent: <SuperAdminAdminManagement />,
    deliveriesComponent: <SuperAdminDeliveryManagement />,
    statisticsComponent: <SuperAdminStatistics />,
    inviteDonationComponent: <SuperAdminInviteForm type="donation_center" />,
    inviteHospitalComponent: <SuperAdminInviteForm type="hospital" />,
    addHospitalComponent: <SuperAdminInviteForm type="add_hospital" />,
    addCenterComponent: <SuperAdminInviteForm type="add_center" />,
    searchComponent: <SearchBar />,
  };

  return <DashboardLayout config={dashboardConfig} />;
};

export default SuperAdminDashboard;