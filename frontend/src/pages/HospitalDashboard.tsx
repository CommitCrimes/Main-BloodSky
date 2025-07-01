import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Avatar,
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
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logoImage from '@/assets/logo.png';
import coeurImage from '@/assets/coeur_dashboard.png';
import theme from '@/theme/theme';
import HospitalUserManagement from '@/components/HospitalUserManagement';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const drawerWidth = 280;

const HospitalDashboard = () => {
  const auth = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
    { id: 'historique', label: 'Historique', icon: <HistoryOutlined /> },
    { id: 'profil', label: 'Mon profil', icon: <AccountCircleOutlined /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsOutlined />, hasNotification: true },
    { id: 'livraison', label: 'Se faire livrer', icon: <LocalShippingOutlined /> },
    { id: 'contact', label: 'Contact', icon: <ContactSupportOutlined /> },
    ...(auth.user?.role?.admin ? [{ id: 'users', label: 'Gestion des utilisateurs', icon: <GroupOutlined /> }] : []),
  ];

  // livraisons
  const deliveryData = [
    { name: 'Lun', livraisons: 4, echecs: 1 },
    { name: 'Mar', livraisons: 6, echecs: 0 },
    { name: 'Mer', livraisons: 8, echecs: 2 },
    { name: 'Jeu', livraisons: 5, echecs: 1 },
    { name: 'Ven', livraisons: 7, echecs: 0 },
    { name: 'Sam', livraisons: 3, echecs: 1 },
    { name: 'Dim', livraisons: 2, echecs: 0 },
  ];

  // statuts
  const statusData = [
    { name: 'Réussies', value: 45, color: '#10b981' },
    { name: 'En attente', value: 30, color: '#f59e0b' },
    { name: 'Échecs', value: 8, color: '#ef4444' },
  ];

  // notifications récentes
  const recentNotifications = [
    { id: 1, message: 'Livraison urgente O- programmée', time: '10min', priority: 'high' },
    { id: 2, message: 'Stock A+ faible', time: '1h', priority: 'medium' },
    { id: 3, message: 'Nouvelle livraison confirmée', time: '2h', priority: 'low' },
  ];

  // Position de l'hôpital pour la carte
  const hospitalPosition: [number, number] = [48.8566, 2.3522];

  const handleMenuClick = (itemId: string) => {
    setActiveView(itemId);
  };

  const handleLogout = () => {
    auth.logout();
  };

  const handleHistoryClick = () => {
    setActiveView('historique');
  };

  const handleNotificationsClick = () => {
    setActiveView('notifications');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error' as const;
      case 'medium': return 'warning' as const;
      case 'low': return 'info' as const;
      default: return 'default' as const;
    }
  };

  const renderDashboardContent = () => (
    <Box sx={{ 
      backgroundColor: 'background.default', 
      minHeight: '100vh', 
      p: 3,
      position: 'relative'
    }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: '3rem', 
            color: '#981A0E', 
            fontFamily: 'Iceland, cursive',
            mb: 1 
          }}
        >
          Bon retour {auth.user?.userFirstname}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.primary', 
            fontFamily: 'Share Tech, monospace' 
          }}
        >
          Vue d'ensemble de votre hôpital
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 2, py: 1 }}>
        
        <Box sx={{ display: 'flex', gap: 6, width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          
          {/* Card Livraisons à venir - Gauche */}
          <Box sx={{ flex: '1 1 350px', maxWidth: '400px' }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                height: '300px',
                width: '400px',
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
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: 'text.primary' }}>
                  Livraisons
                </Typography>
                <HistoryOutlined sx={{ color: '#008EFF' }} />
              </Box>
              <Box sx={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deliveryData}>
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
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: '0 0 300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                  transform: 'translateY(200px) scale(0.6)',
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
                src={coeurImage}
                alt="Cœur Dashboard"
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
          <Box sx={{ flex: '1 1 350px', maxWidth: '400px' }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                height: '300px',
                width: '400px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', mb: 2 }}>
                Statuts des livraisons
              </Typography>
              <Box sx={{ height: '230px', width: '100%'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {statusData.map((entry) => (
                  <Chip
                    key={entry.name}
                    label={`${entry.name}: ${entry.value}`}
                    size="small"
                    sx={{ 
                      backgroundColor: entry.color,
                      color: 'white',
                      fontSize: '0.7rem',
                      fontFamily: 'Share Tech, monospace'
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 6, width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          
          {/* Carte Leaflet - Gauche */}
          <Box sx={{ flex: '1 1 500px', maxWidth: '550px' }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                width: '550px',
                height: '320px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: 'text.primary' }}>
                  Localisation
                </Typography>
                <LocationOnOutlined sx={{ color: '#10b981' }} />
              </Box>
              <Box sx={{ height: '225px', width: '500px', borderRadius: 2, overflow: 'hidden' }}>
                <MapContainer
                  center={hospitalPosition}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={hospitalPosition}>
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
          <Box sx={{ flex: '1 1 500px', maxWidth: '550px' }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                height: '320px',
                width: '550px',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
              onClick={handleNotificationsClick}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: 'text.primary' }}>
                  Notifications récentes
                </Typography>
                <NotificationsOutlined sx={{ color: '#008EFF' }} />
              </Box>
              <List dense>
                {recentNotifications.map((notif) => (
                  <ListItem 
                    key={notif.id}
                    sx={{ 
                      borderLeft: `4px solid ${
                        notif.priority === 'high' ? '#ef4444' :
                        notif.priority === 'medium' ? '#f59e0b' : '#008EFF'
                      }`,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: 1,
                      mb: 1,
                      py: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontFamily: 'Share Tech, monospace', fontSize: '0.9rem', color: '#5C7F9B' }}>
                          {notif.message}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ fontFamily: 'Share Tech, monospace', fontSize: '0.7rem', color: '#5C7F9B', opacity: 0.7 }}>
                          Il y a {notif.time}
                        </Typography>
                      }
                    />
                    <Chip 
                      label={notif.priority}
                      size="small"
                      color={getPriorityColor(notif.priority)}
                      sx={{ fontFamily: 'Share Tech, monospace' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', backgroundColor: 'background.default', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#FFFBFB',
            },
          }}
        >
          {/* Header avec logo */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={logoImage}
                alt="BloodSky Logo"
                sx={{ width: 150, height:150, m: "auto" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/blood-drop.svg';
                }}
              />
            </Box>

          </Box>

          {/* Menu navigation */}
          <List sx={{ py: 2, '& .MuiListItemButton-root': { mb: 2 } }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                sx={{
                  mx: 1,
                  mb: 2,
                  borderRadius: 1,
                  py: 2,
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
                      variant="dot"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
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
                        fontSize: '28px',
                        lineHeight: '100%',
                        letterSpacing: '-4%',
                        textAlign: 'center',
                        color: activeView === item.id ? 'primary.main' : 'text.primary'
                      }
                    }
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, borderTop: '1px solid #e0e0e0' }}>
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
                fontSize: '16px',
                lineHeight: '100%',
                letterSpacing: '-4%',
                textAlign: 'center',
                '&:hover': {
                  backgroundColor: 'rgba(92, 127, 155, 0.1)',
                  borderColor: 'text.primary',
                },
              }}
            >
              Déconnexion
            </Button>
          </Box>
        </Drawer>

        {/* Contenu principal */}
        <Box sx={{ flexGrow: 1 }}>
          {activeView === 'users' && auth.user?.role?.admin && auth.user?.role?.hospitalId ? (
            <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
              <HospitalUserManagement hospitalId={auth.user.role.hospitalId} />
            </Box>
          ) : activeView === 'dashboard' ? (
            renderDashboardContent()
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
                    textAlign: 'center',
                    fontFamily: 'Share Tech, monospace',
                    color: '#5C7F9B'
                  }}
                >
                  {menuItems.find(item => item.id === activeView)?.label}
                </Typography>
                <Typography 
                  sx={{ 
                    textAlign: 'center', 
                    mt: 2,
                    fontFamily: 'Share Tech, monospace',
                    color: '#5C7F9B'
                  }}
                >
                  Cette section sera bientôt disponible
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default HospitalDashboard;