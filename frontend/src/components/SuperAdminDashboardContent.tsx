import React, { useState, useEffect } from 'react';

const commonStyles = {
  gradientText: {
    background: 'linear-gradient(45deg, #981A0E, #C41E3A)',
    backgroundClip: 'text' as const,
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
  },
};
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  FlightTakeoff,
  LocalShipping,
  People,
  Business,
  LocalHospital,
  Warning,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api/api';

interface OverviewStats {
  totalUsers: number;
  totalHospitals: number;
  totalCenters: number;
  totalDeliveries: number;
  totalDrones: number;
  urgentDeliveries: number;
}

interface Statistics {
  overview: OverviewStats;
  deliveriesByStatus: { status: string; count: number }[];
  monthlyDeliveries: { month: string; deliveries: number }[];
}

interface SuperAdminDashboardContentProps {
  onNavigate: (view: string) => void;
}

const SuperAdminDashboardContent: React.FC<SuperAdminDashboardContentProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<Statistics>('/superadmin/statistics');
        setStats(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des statistiques...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) return null;

  const overviewCards = [
    {
      title: 'Utilisateurs Totaux',
      value: stats.overview.totalUsers,
      icon: <People />,
      color: '#1976d2',
      action: () => onNavigate('users')
    },
    {
      title: 'Drones Actifs',
      value: stats.overview.totalDrones,
      icon: <FlightTakeoff />,
      color: '#2e7d32',
      action: () => onNavigate('drones')
    },
    {
      title: 'Livraisons',
      value: stats.overview.totalDeliveries,
      icon: <LocalShipping />,
      color: '#ed6c02',
      action: () => onNavigate('deliveries')
    },
    {
      title: 'Hôpitaux',
      value: stats.overview.totalHospitals,
      icon: <LocalHospital />,
      color: '#9c27b0',
      action: () => onNavigate('statistics')
    },
    {
      title: 'Centres de Don',
      value: stats.overview.totalCenters,
      icon: <Business />,
      color: '#d32f2f',
      action: () => onNavigate('statistics')
    },
    {
      title: 'Livraisons Urgentes',
      value: stats.overview.urgentDeliveries,
      icon: <Warning />,
      color: '#ff5722',
      action: () => onNavigate('deliveries')
    },
  ];
  return (
    <Box sx={{ 
      px: { xs: 2, sm: 3, md: 4, lg: 5 },
      py: { xs: 2, sm: 3 },
      maxWidth: '1400px',
      mx: 'auto'
    }}>
      {/* Vue d'ensemble */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1.8rem', sm: '2.2rem' },
            mb: 0.5,
            fontFamily: 'Iceland, cursive',
            ...commonStyles.gradientText,
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Vue d'ensemble du système
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 3,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Supervision générale de l'écosystème BloodSky
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
          xl: 'repeat(3, 1fr)'
        },
        gap: { xs: 2, sm: 2.5, md: 3 }, 
        mb: { xs: 3, sm: 4, md: 5 }
      }}>
        {overviewCards.map((card, index) => (
          <Card 
            key={index}
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid #e0e0e0',
              '&:hover': { 
                transform: { xs: 'translateY(-4px)', sm: 'translateY(-8px)' },
                boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                border: `1px solid ${card.color}40`
              }
            }}
            onClick={card.action}
          >
              <CardContent sx={{ 
                p: { xs: 2, sm: 2.5, md: 3 }
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box sx={{ 
                    p: { xs: 1, sm: 1.2, md: 1.5 }, 
                    borderRadius: 2, 
                    backgroundColor: `${card.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {React.cloneElement(card.icon, { 
                      fontSize: 'large',
                      sx: { 
                        color: card.color,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                      }
                    })}
                  </Box>
                  <Box textAlign="right">
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: card.color,
                        lineHeight: 1,
                        fontSize: { 
                          xs: '1.5rem', 
                          sm: '1.75rem', 
                          md: '2rem',
                          lg: '2.125rem'
                        }
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
                <Typography 
                  color="text.secondary" 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
        ))}
      </Box>

      {/* Actions rapides - Section dédiée */}
      <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            mb: { xs: 2, sm: 2.5, md: 3 },
            color: '#1976d2',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          🚀 Actions rapides
        </Typography>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: '1px solid #e0e0e0'
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)' 
              },
              gap: { xs: 2, sm: 2.5, md: 3 }
            }}>
              <Button
                variant="contained"
                startIcon={<FlightTakeoff />}
                onClick={() => onNavigate('drones')}
                sx={{ 
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1b5e20, #2e7d32)',
                    transform: { xs: 'translateY(-1px)', sm: 'translateY(-2px)' }
                  }
                }}
              >
                Gérer Drones
              </Button>
              <Button
                variant="contained"
                startIcon={<LocalShipping />}
                onClick={() => onNavigate('deliveries')}
                sx={{ 
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  background: 'linear-gradient(45deg, #ed6c02, #ff9800)',
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #e65100, #ed6c02)',
                    transform: { xs: 'translateY(-1px)', sm: 'translateY(-2px)' }
                  }
                }}
              >
                Livraisons
              </Button>
              <Button
                variant="outlined"
                startIcon={<LocalHospital />}
                onClick={() => onNavigate('hospitals')}
                sx={{ 
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  borderWidth: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#9c27b020',
                    borderColor: '#7b1fa2',
                    transform: { xs: 'translateY(-1px)', sm: 'translateY(-2px)' }
                  }
                }}
              >
                Hôpitaux
              </Button>
              <Button
                variant="outlined"
                startIcon={<Business />}
                onClick={() => onNavigate('centers')}
                sx={{ 
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  borderWidth: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#d32f2f20',
                    borderColor: '#c62828',
                    transform: { xs: 'translateY(-1px)', sm: 'translateY(-2px)' }
                  }
                }}
              >
                Centres
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Graphiques et statistiques détaillées */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3 
      }}>
        {/* Évolution mensuelle si disponible */}
        {stats.monthlyDeliveries && stats.monthlyDeliveries.length > 0 && (
          <Box sx={{ 
            flex: '1 1 100%',
            minWidth: 0
          }}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#1976d2',
                    mb: { xs: 2, sm: 2.5, md: 3 },
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    textAlign: { xs: 'center', sm: 'left' }
                  }}
                >
                  📈 Évolution des livraisons
                </Typography>
                <Box sx={{ height: { xs: 250, sm: 300, md: 350 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyDeliveries}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="deliveries" 
                      stroke="#1976d2" 
                      strokeWidth={3}
                      dot={{ fill: '#1976d2', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: '#1976d2' }}
                    />
                  </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SuperAdminDashboardContent;