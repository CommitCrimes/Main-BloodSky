import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  Refresh,
  LocalShipping,
  Warning,
  CheckCircle,
  Schedule,
  Cancel,
  FlightTakeoff,
} from '@mui/icons-material';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../api/api';

interface Delivery {
  delivery_id: number;
  drone_id?: number;
  hospital_id: number;
  center_id: number;
  delivery_status: string;
  delivery_urgent: boolean;
  dte_delivery?: string;
  dte_validation?: string;
  blood_type?: string;
}

const SuperAdminDeliveryManagement: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/deliveries');
      // S'assurer que response.data est un tableau
      const deliveriesData = Array.isArray(response.data) ? response.data : [];
      setDeliveries(deliveriesData);
    } catch (err) {
      console.error('Erreur lors du chargement des livraisons:', err);
      setError('Impossible de charger les livraisons');
      setDeliveries([]); // Réinitialiser avec un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Schedule />;
      case 'in_progress':
        return <FlightTakeoff />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <LocalShipping />;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesFilter = filter === 'all' || delivery.delivery_status === filter;
    const matchesSearch = searchTerm === '' || 
      delivery.delivery_id.toString().includes(searchTerm) ||
      delivery.blood_type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statsData = [
    {
      title: 'Total Livraisons',
      value: deliveries.length,
      icon: <LocalShipping />,
      color: '#1976d2'
    },
    {
      title: 'En Cours',
      value: deliveries.filter(d => d.delivery_status === 'in_progress').length,
      icon: <FlightTakeoff />,
      color: '#2e7d32'
    },
    {
      title: 'Complétées',
      value: deliveries.filter(d => d.delivery_status === 'completed').length,
      icon: <CheckCircle />,
      color: '#ed6c02'
    },
    {
      title: 'Urgentes',
      value: deliveries.filter(d => d.delivery_urgent).length,
      icon: <Warning />,
      color: '#d32f2f'
    }
  ];

  // Données pour le graphique de répartition
  const statusDistribution = [
    { name: 'En attente', value: deliveries.filter(d => d.delivery_status === 'pending').length, color: '#ff9800' },
    { name: 'En cours', value: deliveries.filter(d => d.delivery_status === 'in_progress').length, color: '#2196f3' },
    { name: 'Complétées', value: deliveries.filter(d => d.delivery_status === 'completed').length, color: '#4caf50' },
    { name: 'Annulées', value: deliveries.filter(d => d.delivery_status === 'cancelled').length, color: '#f44336' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des livraisons...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Button onClick={fetchDeliveries} sx={{ ml: 2 }}>
          Réessayer
        </Button>
      </Alert>
    );
  }

  return (
    <Box p={3}>
      {/* Statistiques */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4 
      }}>
        {statsData.map((stat, index) => (
          <Box key={index} sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' },
            minWidth: 0
          }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {React.cloneElement(stat.icon, { fontSize: 'large' })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Graphique de répartition */}
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
                Répartition par Statut
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
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
                Actions Rapides
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button variant="contained" startIcon={<LocalShipping />} fullWidth>
                  Nouvelle Livraison
                </Button>
                <Button variant="outlined" startIcon={<Warning />} fullWidth>
                  Livraisons Urgentes
                </Button>
                <Button variant="outlined" startIcon={<FlightTakeoff />} fullWidth>
                  Assigner Drone
                </Button>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchDeliveries} fullWidth>
                  Actualiser
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tableau des livraisons */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2">
              Liste des Livraisons
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filter}
                  label="Statut"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="in_progress">En cours</MenuItem>
                  <MenuItem value="completed">Complétées</MenuItem>
                  <MenuItem value="cancelled">Annulées</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Drone</TableCell>
                  <TableCell>Type Sanguin</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Urgent</TableCell>
                  <TableCell>Date Création</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.delivery_id}>
                    <TableCell>#{delivery.delivery_id}</TableCell>
                    <TableCell>
                      {delivery.drone_id ? `Drone ${delivery.drone_id}` : 'Non assigné'}
                    </TableCell>
                    <TableCell>
                      <Chip label={delivery.blood_type || 'Non spécifié'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(delivery.delivery_status)}
                        label={delivery.delivery_status}
                        color={getStatusColor(delivery.delivery_status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {delivery.delivery_urgent && (
                        <Chip icon={<Warning />} label="Urgent" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {delivery.dte_delivery ? new Date(delivery.dte_delivery).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuperAdminDeliveryManagement;