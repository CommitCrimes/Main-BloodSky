import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import droneImage from '@/assets/drone2.png';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  HistoryOutlined,
  NotificationsOutlined,
  FlightTakeoffOutlined,
  CloudOutlined,
  WarningAmberOutlined,
  CheckCircleOutlined,
  WbSunnyOutlined,
  CloudQueueOutlined,
  ThunderstormOutlined,
  AcUnitOutlined,
  OpacityOutlined,
  AirOutlined
} from '@mui/icons-material';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    feels_like: number;
  };
  weather: Array<{
    description: string;
    main: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  name: string;
}

interface WeatherForecast {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  dt_txt: string;
}

interface DronistDashboardContentProps {
  onNavigate: (view: string) => void;
}

const DronistDashboardContent: React.FC<DronistDashboardContentProps> = ({ onNavigate }) => {
  const auth = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // FAKE DATAAA
  const deliveryStats = [
    { name: 'Lun', vols: 4, echecs: 0 },
    { name: 'Mar', vols: 7, echecs: 1 },
    { name: 'Mer', vols: 5, echecs: 0 },
    { name: 'Jeu', vols: 8, echecs: 0 },
    { name: 'Ven', vols: 6, echecs: 1 },
    { name: 'Sam', vols: 3, echecs: 0 },
    { name: 'Dim', vols: 2, echecs: 0 },
  ];

  const droneStatusData = [
    { name: 'Actifs', value: 3, color: '#10b981' },
    { name: 'Maintenance', value: 1, color: '#f59e0b' },
    { name: 'Hors service', value: 0, color: '#ef4444' },
  ];

  const recentNotifications = [
    { id: 1, type: 'success', message: 'Livraison terminée avec succès', time: '2min' },
    { id: 2, type: 'warning', message: 'Batterie faible sur Drone-02', time: '15min' },
    { id: 3, type: 'info', message: 'Nouvelle mission assignée', time: '1h' },
  ];

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const nantesLatitude = 47.2098952;
        const nantesLongitude = -1.5513221;
        const API_KEY = '063abe19913c9d0022b08f3b3d3c86aa';
        
        const currentWeatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${nantesLatitude}&lon=${nantesLongitude}&appid=${API_KEY}&units=metric&lang=fr`
        );
        const currentWeatherData = await currentWeatherResponse.json();
        setWeatherData(currentWeatherData);

        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${nantesLatitude}&lon=${nantesLongitude}&appid=${API_KEY}&units=metric&lang=fr`
        );
        const forecastData = await forecastResponse.json();
        
        const dailyForecast = forecastData.list.filter((_: unknown, index: number) => index % 8 === 0).slice(0, 7);
        setWeatherForecast(dailyForecast);
        
      } catch (error) {
        console.error('Erreur lors du chargement de la météo:', error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, []);

  const formatTimeAgo = (time: string) => {
    return `Il y a ${time}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined sx={{ color: '#10b981' }} />;
      case 'warning':
        return <WarningAmberOutlined sx={{ color: '#f59e0b' }} />;
      default:
        return <NotificationsOutlined sx={{ color: '#3b82f6' }} />;
    }
  };

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <WbSunnyOutlined sx={{ color: '#f59e0b', fontSize: 40 }} />;
      case 'clouds':
        return <CloudQueueOutlined sx={{ color: '#6b7280', fontSize: 40 }} />;
      case 'rain':
      case 'drizzle':
        return <OpacityOutlined sx={{ color: '#3b82f6', fontSize: 40 }} />;
      case 'thunderstorm':
        return <ThunderstormOutlined sx={{ color: '#7c3aed', fontSize: 40 }} />;
      case 'snow':
        return <AcUnitOutlined sx={{ color: '#e5e7eb', fontSize: 40 }} />;
      default:
        return <CloudOutlined sx={{ color: '#6b7280', fontSize: 40 }} />;
    }
  };

  const formatDay = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    } else {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
  };

  return (
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
          Bon retour {auth.user?.userFirstname}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.primary', 
            fontFamily: 'Share Tech, monospace',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
          }}
        >
          Tableau de bord du droniste
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, px: { xs: 1, md: 3 }, py: 1 }}>
        
        {/* 1ere rangé - Historique des vols et logo */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, md: 4, lg: 6 }, 
          width: '100%', 
          justifyContent: { lg: 'space-between' },
          alignItems: { xs: 'center', lg: 'stretch' }
        }}>
          
          {/* Card Historique des vols - Gauche */}
          <Box sx={{ 
            flex: { lg: '1 1 350px' }, 
            maxWidth: { xs: '100%', sm: '400px', lg: '420px' },
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
              onClick={() => onNavigate('historique')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Vols effectués
                </Typography>
                <HistoryOutlined sx={{ color: '#008EFF' }} />
              </Box>
              <Box sx={{ height: { xs: '150px', md: '200px' }, width: '100%' }}>
                <ResponsiveContainer width="110%" height="100%" style={{ marginLeft: '-45px' }}>
                  <LineChart data={deliveryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="vols" 
                      stroke="#008EFF" 
                      strokeWidth={3}
                      name="Vols réussis"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="echecs" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Échecs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>

          {/* logo */}
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

              {/* blur*/}
              <Box
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
                src={droneImage}
                alt="Drone Dashboard"
                sx={{
                  maxWidth: '130%',
                  maxHeight: '600px',
                  objectFit: 'contain',
                  opacity: 0.95,
                  zIndex: 2,
                  position: 'relative',
                  transition: 'all 0.3s ease-in-out',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                }}
              />
            </Box>
          </Box>

          {/* Card Statut des drones - Droite */}
          <Box sx={{ 
            flex: { lg: '1 1 350px' }, 
            maxWidth: { xs: '100%', sm: '400px', lg: '420px' },
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
              onClick={() => onNavigate('drones')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Statut des drones
                </Typography>
                <FlightTakeoffOutlined sx={{ color: '#10b981' }} />
              </Box>
              <Box sx={{ height: { xs: '120px', md: '160px' }, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={droneStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {droneStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                flexWrap: 'wrap', 
                gap: { xs: 0.5, md: 1 }, 
                mt: { xs: 1, md: 2 }
              }}>
                {droneStatusData.map((entry) => (
                  <Chip
                    key={entry.name}
                    label={`${entry.name}: ${entry.value}`}
                    size="small"
                    sx={{ 
                      backgroundColor: entry.color,
                      color: 'white',
                      fontSize: { xs: '0.6rem', md: '0.7rem' },
                      fontFamily: 'Share Tech, monospace',
                      height: { xs: '20px', md: '24px' }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* 2eme rangé - Carte météo et notif */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, md: 4, lg: 6 }, 
          width: '100%', 
          justifyContent: { lg: 'space-between' },
          alignItems: { xs: 'center', lg: 'stretch' }
        }}>
          
          {/* Carte météo - Gauche */}
          <Box sx={{ 
            flex: { lg: '1.5 1 450px' }, 
            maxWidth: { xs: '100%', sm: '500px', lg: '600px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, md: 3 }, 
                width: '100%',
                height: { xs: '320px', md: '360px' },
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
              onClick={() => onNavigate('meteo')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Météo - Nantes
                </Typography>
                <CloudOutlined sx={{ color: '#3b82f6' }} />
              </Box>
              
              {loadingWeather ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: { xs: '240px', md: '300px' }, width: '100%' }}>
                  {/* Météo actuelle */}
                  {weatherData && (
                    <Box sx={{ 
                      mb: 0.8, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1.5,
                      backgroundColor: 'rgba(0, 142, 255, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 142, 255, 0.2)',
                      height: '45px'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {React.cloneElement(getWeatherIcon(weatherData.weather[0]?.main || ''), { 
                          sx: { fontSize: 30, color: '#3b82f6' }
                        })}
                        <Box>
                          <Typography variant="h4" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', fontWeight: 'bold', fontSize: '1.3rem', height: '24px' }}>
                            {Math.round(weatherData.main?.temp || 0)}°C
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.8, fontSize: '0.65rem' }}>
                            Ressenti {Math.round(weatherData.main?.feels_like || 0)}°C
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.9, fontSize: '0.8rem' }}>
                          {weatherData.weather?.[0]?.description || 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
                          <AirOutlined sx={{ fontSize: 14, color: '#5C7F9B' }} />
                          <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.8, fontSize: '0.75rem' }}>
                            {(weatherData.wind?.speed || 0).toFixed(1)} m/s
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Prévisions sur 7 jours */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.9, fontSize: '0.8rem' }}>
                      Prévisions 7 jours
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: { xs: '160px', md: '210px' },
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
                      }
                    }}>
                      {weatherForecast.map((forecast, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            p: 1,
                            backgroundColor: index === 0 ? 'rgba(0, 142, 255, 0.05)' : 'rgba(255, 255, 255, 0.3)',
                            borderRadius: 1,
                            border: index === 0 ? '1px solid rgba(0, 142, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.2)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 142, 255, 0.1)',
                              transform: 'translateX(2px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: '100px' }}>
                            {React.cloneElement(getWeatherIcon(forecast.weather[0]?.main || ''), { 
                              sx: { fontSize: 28, color: '#3b82f6' }
                            })}
                            <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', fontWeight: index === 0 ? 'bold' : 'normal', fontSize: '0.8rem' }}>
                              {formatDay(forecast.dt)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.8, fontSize: '0.75rem' }}>
                              {forecast.weather[0]?.description || 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '80px', justifyContent: 'flex-end' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', fontWeight: 'bold', fontSize: '0.8rem' }}>
                              {Math.round(forecast.main?.temp || 0)}°C
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.6, fontSize: '0.7rem' }}>
                              {Math.round(forecast.main?.temp_min || 0)}°/{Math.round(forecast.main?.temp_max || 0)}°
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Notifications récentes - Droite */}
          <Box sx={{ 
            flex: { lg: '1 1 350px' }, 
            maxWidth: { xs: '100%', sm: '400px', lg: '450px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, md: 3 }, 
                height: { xs: '320px', md: '320px' },
                width: '100%',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
              onClick={() => onNavigate('notifications')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Notifications récentes
                </Typography>
                <NotificationsOutlined sx={{ color: '#f59e0b' }} />
              </Box>
              <List dense sx={{ 
                height: { xs: '240px', md: '300px' }, 
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
                {recentNotifications.map((notification) => (
                  <ListItem 
                    key={notification.id}
                    sx={{ 
                      borderLeft: `4px solid ${notification.type === 'success' ? '#10b981' : notification.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      borderRadius: 1,
                      mb: 1,
                      py: 1
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ 
                          fontFamily: 'Share Tech, monospace', 
                          fontSize: { xs: '0.75rem', md: '0.9rem' }, 
                          color: '#5C7F9B',
                          lineHeight: 1.2
                        }}>
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ 
                          fontFamily: 'Share Tech, monospace', 
                          fontSize: { xs: '0.6rem', md: '0.7rem' }, 
                          color: '#5C7F9B', 
                          opacity: 0.7 
                        }}>
                          {formatTimeAgo(notification.time)}
                        </Typography>
                      }
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
};

export default DronistDashboardContent;