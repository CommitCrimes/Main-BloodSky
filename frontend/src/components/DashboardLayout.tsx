/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, type ReactNode } from 'react';
import {
  Typography,
  Box,
  Paper,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  ThemeProvider,
  Drawer,
  ListItemButton,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
} from '@mui/material';
import {
  NotificationsOutlined,
  LogoutOutlined,
  HistoryOutlined,
  LocationOnOutlined,
  DashboardOutlined,
  AccountCircleOutlined,
  LocalShippingOutlined,
  ContactSupportOutlined,
  GroupOutlined,
  MenuOutlined,
  NotificationsNone,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logoImage from '@/assets/logo.png';
import theme from '@/theme/theme';
import { useAuth } from '@/hooks/useAuth';
import authStore from '@/stores/authStore';
import { NotificationStore } from '@/stores/NotificationStore';
import NotificationManagement from './NotificationManagement';
import { dashboardApi } from '@/api/dashboard';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const drawerWidth = 280;

interface DashboardConfig {
  title: string;
  subtitle: string;
  centerImage: string;
  centerImageAlt: string;
  position: [number, number];
  chartTitle: string;
  userManagementComponent?: ReactNode;
  profileManagementComponent?: ReactNode;
  historyManagementComponent?: ReactNode;
  orderBloodComponent?: ReactNode;
  customDashboardComponent?: ReactNode | ((setActiveView: (view: string) => void) => ReactNode);
  menuItems?: Array<{
    id: string;
    label: string;
    icon: ReactNode;
    hasNotification?: boolean;
  }>;
}

interface DashboardLayoutProps {
  config: DashboardConfig;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ config }) => {
  const auth = useAuth();
  const muiTheme = useTheme();
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('bloodsky-active-view') || 'dashboard';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationStore] = useState(() => new NotificationStore());
  
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [deliveryStats, setDeliveryStats] = useState<any[]>([]);
  const [statusStats, setStatusStats] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    localStorage.setItem('bloodsky-active-view', activeView);
  }, [activeView]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoadingStats(true);
      try {
        await notificationStore.fetchNotifications(5);
        setRecentNotifications(notificationStore.notifications.slice(0, 5));

        try {
          const stats = await dashboardApi.getDeliveryStats();
          setDeliveryStats(stats.deliveryData);
          setStatusStats(stats.statusStats);
        } catch (statsError) {
          console.error('Erreur lors du chargement des statistiques:', statsError);
          setDeliveryStats([
            { name: 'Lun', livraisons: 0, echecs: 0 },
            { name: 'Mar', livraisons: 0, echecs: 0 },
            { name: 'Mer', livraisons: 0, echecs: 0 },
            { name: 'Jeu', livraisons: 0, echecs: 0 },
            { name: 'Ven', livraisons: 0, echecs: 0 },
            { name: 'Sam', livraisons: 0, echecs: 0 },
            { name: 'Dim', livraisons: 0, echecs: 0 },
          ]);
          setStatusStats([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du dashboard:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadDashboardData();

    const interval = setInterval(() => {
      notificationStore.refreshUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [notificationStore]);

  // Détermine le libellé selon le type d'utilisateur
  const getDeliveryLabel = () => {
    if (auth.user?.role?.centerId) {
      return 'Livrer'; // Centre de donation = celui qui livre
    }
    return 'Se faire livrer'; // Hôpital = celui qui reçoit
  };

  const defaultMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsOutlined />, hasNotification: notificationStore.unreadCount > 0 },
    { id: 'historique', label: 'Historique', icon: <HistoryOutlined /> },
    { id: 'profil', label: 'Mon profil', icon: <AccountCircleOutlined /> },
    // Onglet livraison uniquement pour les hôpitaux
    ...(!auth.user?.role?.centerId ? [{ id: 'livraison', label: getDeliveryLabel(), icon: <LocalShippingOutlined /> }] : []),
    { id: 'contact', label: 'Contact', icon: <ContactSupportOutlined /> },
    ...(auth.user?.role?.admin ? [{ id: 'users', label: 'Gestion des utilisateurs', icon: <GroupOutlined /> }] : []),
  ];

  const menuItems = config.menuItems || defaultMenuItems;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? 'À l\'instant' : `${diffInMinutes}min`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}j`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Faible';
      default:
        return 'Inconnu';
    }
  };

  const handleMenuClick = (itemId: string) => {
    if (itemId === 'deconnexion') {
      authStore.logout();
    } else {
      setActiveView(itemId);
    }
  };

  const handleLogout = () => {
    authStore.logout();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleHistoryClick = () => {
    setActiveView('historique');
  };

  const renderDashboardContent = () => (
    <Box sx={{ 
      backgroundColor: '#e3f8fe', 
      minHeight: '100vh', 
      p: { xs: 1, sm: 2, md: 3 },
      position: 'relative'
    }}>
      <Box sx={{ mb: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' }, 
            color: '#981A0E', 
            fontFamily: 'Iceland, cursive',
            mb: 1 
          }}
        >
          {config.title}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.primary', 
            fontFamily: 'Share Tech, monospace',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
          }}
        >
          {config.subtitle}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 2 }, px: { xs: 0, md: 2 }, py: 1 }}>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, md: 4, lg: 6 }, 
          width: '100%', 
          justifyContent: { lg: 'space-between' },
          alignItems: { xs: 'center', lg: 'stretch' }
        }}>
          
          {/* Card Livraisons à venir - Gauche */}
          <Box sx={{ 
            flex: { lg: '1 1 400px' }, 
            maxWidth: { xs: '100%', sm: '400px', lg: '450px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, md: 3 }, 
                height: { xs: '250px', md: '300px' },
                width: '100%',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
              onClick={handleHistoryClick}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  {config.chartTitle}
                </Typography>
                <HistoryOutlined sx={{ color: '#008EFF' }} />
              </Box>
              <Box sx={{ height: { xs: '150px', md: '200px' }, width: '100%' }}>
                {isLoadingStats ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : deliveryStats.length === 0 || deliveryStats.every(d => d.livraisons === 0) ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    textAlign: 'center'
                  }}>
                    <HistoryOutlined sx={{ fontSize: 48, color: 'rgba(92, 127, 155, 0.5)', mb: 1 }} />
                    <Typography sx={{ 
                      fontFamily: 'Share Tech, monospace', 
                      fontSize: '0.9rem', 
                      color: 'rgba(92, 127, 155, 0.7)'
                    }}>
                      Aucune livraison cette semaine
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="110%" height="100%" style={{ marginLeft: '-45px' }}>
                    <LineChart data={deliveryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="livraisons" 
                        stroke="#008EFF" 
                        strokeWidth={3}
                        name="Livraisons"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Paper>
          </Box>

          <Box sx={{ 
            flex: { lg: '0 0 300px' }, 
            display: { xs: 'none', md: 'flex', lg: 'flex' }, 
            justifyContent: 'center', 
            alignItems: 'center',
            width: { xs: '100%', lg: '300px' },
            order: { xs: -1, lg: 0 }
          }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '380px',
                width: '100%',
                position: 'relative'
              }}
            >
              {/* Ombre */}
              <Box
                className="heart-shadow"
                sx={{
                  position: 'absolute',
                  width: '300px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(94, 141, 156, 0.4)',
                  filter: 'blur(20px)',
                  transform: 'translateY(190px) scale(0.6)',
                  zIndex: 1,
                  transition: 'all 0.3s ease-in-out',
                }}
              />

              {/* Cercle blur*/}
              <Box
                className="heart-blur"
                sx={{
                  position: 'absolute',
                  width: '1000px',
                  height: '1000px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  filter: 'blur(120px)',
                  zIndex: -1,
                  transition: 'all 0.3s ease-in-out',
                }}
              />
              
              <Box
                component="img"
                src={config.centerImage}
                alt={config.centerImageAlt}
                sx={{
                  maxWidth: '95%',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  opacity: 0.95,
                  zIndex: 2,
                  position: 'relative',
                  transition: 'all 0.3s ease-in-out',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </Box>
          </Box>

          {/* Card Statuts des livraisons - Droite */}
          <Box sx={{ 
            flex: { lg: '1 1 400px' }, 
            maxWidth: { xs: '100%', sm: '400px', lg: '450px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, md: 3 }, 
                height: { xs: '250px', md: '300px' },
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Statuts des livraisons
                </Typography>
              </Box>
              <Box sx={{ height: { xs: '120px', md: '160px' }, width: '100%'}}>
                {isLoadingStats ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : statusStats.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    textAlign: 'center'
                  }}>
                    <LocalShippingOutlined sx={{ fontSize: 48, color: 'rgba(92, 127, 155, 0.5)', mb: 1 }} />
                    <Typography sx={{ 
                      fontFamily: 'Share Tech, monospace', 
                      fontSize: '0.9rem', 
                      color: 'rgba(92, 127, 155, 0.7)'
                    }}>
                      Aucune livraison enregistrée
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="115%" height="100%" style={{ marginLeft: '-45px' }}>
                    <BarChart data={statusStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(92, 127, 155, 0.2)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#5C7F9B', fontFamily: 'Share Tech, monospace', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#5C7F9B', fontFamily: 'Share Tech, monospace', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(92, 127, 155, 0.2)',
                          borderRadius: '8px',
                          fontFamily: 'Share Tech, monospace'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {statusStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                flexWrap: 'wrap', 
                gap: { xs: 0.5, md: 1 }, 
                mt: { xs: 1, md: 2 },
                px: { xs: 1, md: 0 }
              }}>
                {statusStats.map((entry) => (
                  <Chip
                    key={entry.name}
                    label={`${entry.name}: ${entry.value}`}
                    size="small"
                    sx={{ 
                      backgroundColor: entry.color,
                      color: 'white',
                      fontSize: { xs: '0.6rem', md: '0.7rem' },
                      fontFamily: 'Share Tech, monospace',
                      height: { xs: '20px', md: '24px' },
                      '& .MuiChip-label': {
                        px: { xs: 0.5, md: 1 }
                      }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, md: 4, lg: 6 }, 
          width: '100%', 
          justifyContent: { lg: 'space-between' },
          alignItems: { xs: 'center', lg: 'stretch' }
        }}>
          
          {/* Carte Leaflet - Gauche */}
          <Box sx={{ 
            flex: { lg: '1 1 500px' }, 
            maxWidth: { xs: '100%', sm: '500px', lg: '550px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, md: 3 }, 
                width: '100%',
                height: { xs: '280px', md: '320px' },
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Localisation
                </Typography>
                <LocationOnOutlined sx={{ color: '#10b981' }} />
              </Box>
              <Box sx={{ 
                height: { xs: '185px', md: '225px' }, 
                width: '100%', 
                borderRadius: 2, 
                overflow: 'hidden' 
              }}>
                <MapContainer
                  center={config.position}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={config.position}>
                    <Popup>
                      Votre hôpital<br />
                      Centre de soins principal
                    </Popup>
                  </Marker>
                </MapContainer>
              </Box>
            </Paper>
          </Box>

          {/* Notifications récentes - Droite */}
          <Box sx={{ 
            flex: { lg: '1 1 500px' }, 
            maxWidth: { xs: '100%', sm: '500px', lg: '550px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, md: 3 }, 
                height: { xs: '280px', md: '320px' },
                width: '100%',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
              onClick={() => setActiveView('notifications')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Notifications récentes
                </Typography>
                <NotificationsOutlined sx={{ color: '#008EFF' }} />
              </Box>
              <List dense sx={{ 
                height: { xs: '200px', md: '240px' }, 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255,255,255,0.1)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(92, 127, 155, 0.3)',
                  borderRadius: '2px',
                },
              }}>
                {isLoadingStats ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : recentNotifications.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    textAlign: 'center'
                  }}>
                    <NotificationsNone sx={{ fontSize: 48, color: 'rgba(92, 127, 155, 0.5)', mb: 1 }} />
                    <Typography sx={{ 
                      fontFamily: 'Share Tech, monospace', 
                      fontSize: '0.9rem', 
                      color: 'rgba(92, 127, 155, 0.7)'
                    }}>
                      Aucune notification récente
                    </Typography>
                  </Box>
                ) : (
                  recentNotifications.map((notif) => (
                    <ListItem 
                      key={notif.notificationId}
                      sx={{ 
                        borderLeft: `4px solid ${getPriorityColor(notif.priority)}`,
                        backgroundColor: notif.isRead ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)',
                        borderRadius: 1,
                        mb: 1,
                        py: 1
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ 
                            fontFamily: 'Share Tech, monospace', 
                            fontSize: { xs: '0.75rem', md: '0.9rem' }, 
                            color: '#5C7F9B',
                            lineHeight: 1.2,
                            fontWeight: notif.isRead ? 'normal' : 'bold'
                          }}>
                            {notif.title}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ 
                            fontFamily: 'Share Tech, monospace', 
                            fontSize: { xs: '0.6rem', md: '0.7rem' }, 
                            color: '#5C7F9B', 
                            opacity: 0.7 
                          }}>
                            {formatTimeAgo(notif.createdAt)}
                          </Typography>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip 
                          label={getPriorityLabel(notif.priority)}
                          size="small"
                          sx={{ 
                            fontFamily: 'Share Tech, monospace', 
                            fontSize: '0.6rem',
                            backgroundColor: getPriorityColor(notif.priority),
                            color: 'white',
                            height: 18
                          }}
                        />
                        {!notif.isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#008EFF',
                            }}
                          />
                        )}
                      </Box>
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const drawer = (
    <Box>
      {/* Header avec logo */}
      <Box sx={{ p: { xs: 2, md: 3 }, textAlign: 'center'}}>
        <Box
          component="img"
          src={logoImage}
          alt="BloodSky Logo"
          sx={{ 
            width: { xs: 120, md: 180 }, 
            height: { xs: 120, md: 180 }, 
            m: "auto" 
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/blood-drop.svg';
          }}
        />
      </Box>

      {/* Menu navigation */}
      <List sx={{ py: 2, '& .MuiListItemButton-root': { mb: { xs: 1, md: 3 } } }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => {
              handleMenuClick(item.id);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              mx: 2,
              borderRadius: '12px',
              '&:hover': {
                backgroundColor: 'rgba(0, 142, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              {item.icon}
              {item.hasNotification && (
                <Badge
                  badgeContent=" "
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    '& .MuiBadge-badge': {
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      minWidth: 'unset',
                      padding: 0,
                    }
                  }}
                />
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  style: {
                    fontFamily: 'Share Tech, monospace',
                    fontWeight: 400,
                    fontSize: isMobile ? '18px' : '28px',
                    lineHeight: '100%',
                    letterSpacing: '-4%',
                    textAlign: 'center',
                    color: activeView === item.id ? '#008EFF' : '#5C7F9B'
                  }
                }
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        p: 2, 
        borderTop: '1px solid #e0e0e0' 
      }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutOutlined />}
          onClick={handleLogout}
          sx={{
            color: 'text.primary',
            borderColor: 'text.primary',
            fontFamily: 'Share Tech, monospace',
            fontWeight: 400,
            fontSize: { xs: '12px', md: '16px' },
            lineHeight: '100%',
            letterSpacing: '-4%',
            textAlign: 'center',
            '&:hover': {
              borderColor: 'text.primary',
              backgroundColor: 'rgba(92, 127, 155, 0.1)',
            }
          }}
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', backgroundColor: '#e3f8fe', minHeight: '100vh' }}>
        {/* Mobile AppBar */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              width: '100%',
              backgroundColor: '#FFFBFB',
              color: '#5C7F9B',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuOutlined />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontFamily: 'Iceland, cursive',
                  color: '#981A0E',
                  fontSize: '1.5rem'
                }}
              >
                BloodSky
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Sidebar */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                backgroundColor: '#FFFBFB',
                borderRadius: '0 !important',
                borderTopRightRadius: '0 !important',
                borderBottomRightRadius: '0 !important',
                borderTopLeftRadius: '0 !important',
                borderBottomLeftRadius: '0 !important',
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Contenu principal */}
        <Box sx={{ 
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, md: 0 } // Marge pour l'AppBar mobile
        }}>
          {activeView === 'users' && auth.user?.role?.admin && config.userManagementComponent ? (
            <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
              {config.userManagementComponent}
            </Box>
          ) : activeView === 'profil' && config.profileManagementComponent ? (
            <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
              {config.profileManagementComponent}
            </Box>
          ) : activeView === 'notifications' ? (
            <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
              <NotificationManagement notificationStore={notificationStore} />
            </Box>
          ) : activeView === 'historique' && config.historyManagementComponent ? (
            <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
              {config.historyManagementComponent}
            </Box>
          ) : activeView === 'livraison' && config.orderBloodComponent ? (
            <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
              {config.orderBloodComponent}
            </Box>
          ) : activeView === 'dashboard' ? (
            config.customDashboardComponent ? (
              <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
                {typeof config.customDashboardComponent === 'function' 
                  ? config.customDashboardComponent(setActiveView) 
                  : config.customDashboardComponent}
              </Box>
            ) : (
              renderDashboardContent()
            )
          ) : (
            <Box sx={{ 
              backgroundColor: 'background.default', 
              minHeight: '100vh', 
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Paper sx={{ p: 4, backgroundColor: '#FBBDBE' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'text.primary',
                    fontFamily: 'Share Tech, monospace',
                    textAlign: 'center'
                  }}
                >
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)} - En construction
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardLayout;