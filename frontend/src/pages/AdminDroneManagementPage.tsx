import droneImage from '@/assets/drone2.png';
import DashboardLayout from '@/components/DashboardLayout';
import SuperAdminDroneManagement from '@/components/SuperAdminDroneManagement';
import ContactWidgetAuthed from '@/components/SupportItEmailingAuth';
import {
  FlightTakeoffOutlined,
  SettingsOutlined,
  ContactSupportOutlined,
  ArrowBackOutlined
} from '@mui/icons-material';

const AdminDroneManagementPage = () => {

  // Configuration pour la page de gestion des drones super admin
  const menuItems = [
    { id: 'dashboard', label: 'Retour Dashboard', icon: <ArrowBackOutlined /> },
    { id: 'drone-management', label: 'Gestion Drones', icon: <FlightTakeoffOutlined /> },
    { id: 'drone-settings', label: 'Configuration', icon: <SettingsOutlined /> },
    { id: 'contact', label: 'Contact', icon: <ContactSupportOutlined /> },
  ];

  const dashboardConfig = {
    title: `Gestion des Drones`,
    subtitle: 'Administration et supervision des drones BloodSky',
    centerImage: droneImage,
    centerImageAlt: 'Drone Management',
    position: [47.2098952, -1.5513221] as [number, number],
    chartTitle: 'Statut des drones',
    menuItems: menuItems,
    customDashboardComponent: () => (
      <SuperAdminDroneManagement />
    ),
    contactComponent: <ContactWidgetAuthed />,
  };

  return <DashboardLayout config={dashboardConfig} />;
};

export default AdminDroneManagementPage;