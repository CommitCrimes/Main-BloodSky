import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  FlightTakeoff,
  People,
  Business,
  LocalHospital,
  Timeline,
  Assessment
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../api/api';

interface Statistics {
  overview: {
    totalUsers: number;
    totalHospitals: number;
    totalCenters: number;
    totalDeliveries: number;
    totalDrones: number;
    urgentDeliveries: number;
  };
  deliveriesByStatus: { status: string; count: number }[];
  monthlyDeliveries: { month: string; deliveries: number }[];
  performanceMetrics: {
    averageDeliveryTime: number;
    successRate: number;
    dronesUtilization: number;
  };
  trendsData: {
    usersGrowth: number;
    deliveriesGrowth: number;
    efficiencyImprovement: number;
  };
}

const SuperAdminStatistics: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/superadmin/statistics?range=${timeRange}`);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Données mockées pour la démonstration
  const mockMonthlyData = [
    { month: 'Jan', deliveries: 45, users: 120, drones: 8 },
    { month: 'Fév', deliveries: 52, users: 135, drones: 10 },
    { month: 'Mar', deliveries: 48, users: 142, drones: 12 },
    { month: 'Avr', deliveries: 61, users: 158, drones: 15 },
    { month: 'Mai', deliveries: 55, users: 171, drones: 18 },
    { month: 'Juin', deliveries: 67, users: 186, drones: 20 }
  ];

  const kpiCards = [
    {
      title: 'Temps de Livraison Moyen',
      value: `${stats.performanceMetrics?.averageDeliveryTime || 15} min`,
      trend: -5,
      icon: <Timeline />,
      color: '#1976d2'
    },
    {
      title: 'Taux de Réussite',
      value: `${stats.performanceMetrics?.successRate || 97}%`,
      trend: 2,
      icon: <Assessment />,
      color: '#2e7d32'
    },
    {
      title: 'Utilisation Drones',
      value: `${stats.performanceMetrics?.dronesUtilization || 78}%`,
      trend: 8,
      icon: <FlightTakeoff />,
      color: '#ed6c02'
    },
    {
      title: 'Croissance Utilisateurs',
      value: `${stats.trendsData?.usersGrowth || 12}%`,
      trend: 12,
      icon: <People />,
      color: '#9c27b0'
    }
  ];

  return (
    <Box p={3}>
      {/* Contrôles */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Statistiques Détaillées
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={timeRange}
            label="Période"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">Cette semaine</MenuItem>
            <MenuItem value="month">Ce mois</MenuItem>
            <MenuItem value="quarter">Ce trimestre</MenuItem>
            <MenuItem value="year">Cette année</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4 
      }}>
        {kpiCards.map((kpi, index) => (
          <Box key={index} sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' },
            minWidth: 0
          }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {kpi.value}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {kpi.trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                      <Typography 
                        variant="body2" 
                        color={kpi.trend > 0 ? 'success.main' : 'error.main'}
                        sx={{ ml: 0.5 }}
                      >
                        {Math.abs(kpi.trend)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ color: kpi.color }}>
                    {React.cloneElement(kpi.icon, { fontSize: 'large' })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Graphiques principaux */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4 
      }}>
        {/* Évolution des livraisons */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 calc(66.666% - 12px)' },
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution des Métriques Clés
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="deliveries" stroke="#8884d8" strokeWidth={2} name="Livraisons" />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} name="Utilisateurs" />
                  <Line type="monotone" dataKey="drones" stroke="#ffc658" strokeWidth={2} name="Drones" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Répartition des statuts */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 12px)' },
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statuts des Livraisons
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={stats.deliveriesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.deliveriesByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Métriques détaillées */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4 
      }}>
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' },
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance par Zone
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={[
                  { zone: 'Nord', deliveries: 45, success: 95 },
                  { zone: 'Sud', deliveries: 38, success: 98 },
                  { zone: 'Est', deliveries: 52, success: 92 },
                  { zone: 'Ouest', deliveries: 41, success: 96 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deliveries" fill="#8884d8" name="Livraisons" />
                  <Bar dataKey="success" fill="#82ca9d" name="Taux de réussite %" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' },
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Indicateurs Système
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <FlightTakeoff color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Drones Actifs" 
                    secondary={`${stats.overview.totalDrones} drones opérationnels`}
                  />
                  <Chip label="Excellent" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalHospital color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hôpitaux Connectés" 
                    secondary={`${stats.overview.totalHospitals} établissements`}
                  />
                  <Chip label="Stable" color="primary" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Business color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Centres de Don" 
                    secondary={`${stats.overview.totalCenters} centres actifs`}
                  />
                  <Chip label="Croissance" color="warning" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <People color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Utilisateurs Actifs" 
                    secondary={`${stats.overview.totalUsers} utilisateurs`}
                  />
                  <Chip label="En hausse" color="success" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Alertes et recommandations */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3 
      }}>
        <Box sx={{ 
          flex: '1 1 100%',
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommandations Système
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2 
              }}>
                <Box sx={{ 
                  flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 8px)' },
                  minWidth: 0
                }}>
                  <Alert severity="info">
                    <Typography variant="subtitle2">Optimisation Route</Typography>
                    <Typography variant="body2">
                      Réviser les trajets de la zone Est pour améliorer l'efficacité de 8%
                    </Typography>
                  </Alert>
                </Box>
                <Box sx={{ 
                  flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 8px)' },
                  minWidth: 0
                }}>
                  <Alert severity="warning">
                    <Typography variant="subtitle2">Maintenance Préventive</Typography>
                    <Typography variant="body2">
                      3 drones nécessitent une maintenance dans les 7 prochains jours
                    </Typography>
                  </Alert>
                </Box>
                <Box sx={{ 
                  flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 8px)' },
                  minWidth: 0
                }}>
                  <Alert severity="success">
                    <Typography variant="subtitle2">Performance Excellente</Typography>
                    <Typography variant="body2">
                      Taux de satisfaction client de 97% ce mois-ci
                    </Typography>
                  </Alert>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default SuperAdminStatistics;