import { useAuth } from '@/hooks/useAuth';
import droneImage from '@/assets/drone2.png';
import DashboardLayout from '@/components/DashboardLayout';
import DronistDashboardContent from '@/components/DronistDashboardContent';
import {
  DashboardOutlined,
  HistoryOutlined,
  CloudOutlined,
  NotificationsOutlined,
  ContactSupportOutlined,
  FlightTakeoffOutlined
} from '@mui/icons-material';
import HistoryManagementDrone from '@/components/HistoryManagementDrone';
import Contact from './Contact';
import Weather from '@/components/WeatherMap';

const DronistDashboard = () => {
  const auth = useAuth();

  // Configuration spécifique pour le dashboard droniste
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
    { id: 'historique', label: 'Historique', icon: <HistoryOutlined /> },
    { id: 'meteo', label: 'Météo', icon: <CloudOutlined /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsOutlined />, hasNotification: false },
    { id: 'contact', label: 'Contact', icon: <ContactSupportOutlined /> },
    { id: 'drones', label: 'Drones', icon: <FlightTakeoffOutlined /> },
  ];

  const dashboardConfig = {
    title: `Bon retour ${auth.user?.userFirstname}`,
    subtitle: 'Tableau de bord du droniste',
    centerImage: droneImage,
    centerImageAlt: 'Drone Dashboard',
    position: [47.2098952, -1.5513221] as [number, number],
    chartTitle: 'Vols effectués',
    menuItems: menuItems,
    customDashboardComponent: (setActiveView: (view: string) => void) => (
      <DronistDashboardContent onNavigate={setActiveView} />
    ),
        historyManagementComponent: <HistoryManagementDrone />,
        contactComponent: <Contact />,
        weatherComponent: <Weather />,

  };

  return <DashboardLayout config={dashboardConfig} />;
};

export default DronistDashboard;