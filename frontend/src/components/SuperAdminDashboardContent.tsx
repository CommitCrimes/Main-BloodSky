import React, { useState, useEffect } from 'react';
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
    <Box>
      {/* Vue d'ensemble */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Vue d'ensemble du système
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4 
      }}>
        {overviewCards.map((card, index) => (
          <Box key={index} sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' },
            minWidth: 0
          }}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={card.action}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {React.cloneElement(card.icon, { fontSize: 'large' })}
                  </Box>
                </Box>
                <Box mt={2}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    sx={{ color: card.color, borderColor: card.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      card.action();
                    }}
                  >
                    Voir détails
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Graphiques et statistiques détaillées */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3 
      }}>
        {/* Statut des livraisons */}
        {stats.deliveriesByStatus.length > 0 && (
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' },
            minWidth: 0
          }}>
          </Box>
        )}

        {/* Actions rapides */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' },
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions rapides
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<FlightTakeoff />}
                  onClick={() => onNavigate('drones')}
                  fullWidth
                >
                  Gérer les Drones
                </Button>
                <Button
                  variant="contained"
                  startIcon={<People />}
                  onClick={() => onNavigate('users')}
                  fullWidth
                >
                  Gérer les Utilisateurs
                </Button>
                <Button
                  variant="contained"
                  startIcon={<LocalShipping />}
                  onClick={() => onNavigate('deliveries')}
                  fullWidth
                >
                  Gérer les Livraisons
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LocalHospital />}
                  onClick={() => onNavigate('hospitals')}
                  fullWidth
                >
                  Gérer les Hôpitaux
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Business />}
                  onClick={() => onNavigate('centers')}
                  fullWidth
                >
                  Gérer les Centres
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Évolution mensuelle si disponible */}
        {stats.monthlyDeliveries && stats.monthlyDeliveries.length > 0 && (
          <Box sx={{ 
            flex: '1 1 100%',
            minWidth: 0
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Évolution des livraisons
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyDeliveries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="deliveries" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SuperAdminDashboardContent;