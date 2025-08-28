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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  LocalShipping,
  Warning,
  CheckCircle,
  Schedule,
  Cancel,
  FlightTakeoff,
  Assessment,
  LocalHospital,
  ReportProblem,
  Help
} from '@mui/icons-material';
import { api } from '../api/api';

interface Delivery {
  deliveryId: number;
  droneId?: number;
  hospitalId: number;
  centerId: number;
  deliveryStatus?: string;
  deliveryUrgent: boolean;
  dteDelivery?: string;
  dteValidation?: string;
  bloodType?: string;
  bloodQuantity?: number;
  hospitalName?: string;
  centerCity?: string;
}

interface HospitalUrgentStats {
  hospitalId: number;
  hospitalName: string;
  totalDeliveries: number;
  urgentDeliveries: number;
  urgentPercentage: number;
  isAbusing: boolean;
}

const SuperAdminDeliveryManagement: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [hospitalStats, setHospitalStats] = useState<HospitalUrgentStats[]>([]);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/deliveries');
      const deliveriesData = response.data?.deliveries || response.data || [];
      setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);      
      calculateHospitalStats(deliveriesData);
    } catch (err) {
      console.error('Erreur lors du chargement des livraisons:', err);
      setError('Impossible de charger les livraisons');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateHospitalStats = (deliveriesData: Delivery[]) => {
    const hospitalMap = new Map<number, HospitalUrgentStats>();
    
    deliveriesData.forEach(delivery => {
      if (!delivery.hospitalId) return;
      
      if (!hospitalMap.has(delivery.hospitalId)) {
        hospitalMap.set(delivery.hospitalId, {
          hospitalId: delivery.hospitalId,
          hospitalName: delivery.hospitalName || `Hôpital ID: ${delivery.hospitalId}`,
          totalDeliveries: 0,
          urgentDeliveries: 0,
          urgentPercentage: 0,
          isAbusing: false
        });
      }
      
      const stats = hospitalMap.get(delivery.hospitalId)!;
      stats.totalDeliveries++;
      if (delivery.deliveryUrgent) {
        stats.urgentDeliveries++;
      }
    });    
    const statsArray = Array.from(hospitalMap.values()).map(stat => {
      stat.urgentPercentage = stat.totalDeliveries > 0 
        ? (stat.urgentDeliveries / stat.totalDeliveries) * 100 
        : 0;
      stat.isAbusing = stat.urgentPercentage > 50 && stat.totalDeliveries >= 10;
      return stat;
    });    
    statsArray.sort((a, b) => b.urgentPercentage - a.urgentPercentage);
    setHospitalStats(statsArray);
  };

  const getBloodTypeColor = (bloodType: string | undefined | null) => {
    if (!bloodType) return 'default';
    switch (bloodType.toLowerCase()) {
      case 'o+':
      case 'o-':
        return 'error';
      case 'a+':
      case 'a-':
        return 'primary';
      case 'b+':
      case 'b-':
        return 'secondary';
      case 'ab+':
      case 'ab-':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'in_transit':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'delivered':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusVariant = (status: string | undefined | null) => {
    if (!status) return 'outlined';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'filled';
      case 'in_progress':
        return 'filled';
      case 'in_transit':
        return 'filled';
      case 'completed':
        return 'filled';
      case 'delivered':
        return 'filled';
      case 'cancelled':
        return 'filled';
      default:
        return 'outlined';
    }
  };

  const getStatusLabel = (status: string | undefined | null) => {
    if (!status) return 'Inconnu';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'En attente';
      case 'in_progress':
        return 'En cours';
      case 'in_transit':
        return 'En transport';
      case 'completed':
        return 'Terminée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string | undefined | null) => {
    if (!status) return <Help />;
    switch (status.toLowerCase()) {
      case 'pending':
        return <Schedule />;
      case 'in_progress':
        return <FlightTakeoff />;
      case 'in_transit':
        return <LocalShipping />;
      case 'completed':
        return <CheckCircle />;
      case 'delivered':
        return <LocalHospital />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <LocalShipping />;
    }
  };

  const filteredDeliveries = deliveries;

  const statsData = [
    {
      title: 'Total Livraisons',
      value: deliveries.length,
      icon: <LocalShipping />,
      color: '#1976d2'
    },
    {
      title: 'En Cours',
      value: deliveries.filter(d => ['in_progress', 'in_transit'].includes(d.deliveryStatus || '')).length,
      icon: <FlightTakeoff />,
      color: '#2e7d32'
    },
    {
      title: 'Complétées',
      value: deliveries.filter(d => ['completed', 'delivered'].includes(d.deliveryStatus || '')).length,
      icon: <CheckCircle />,
      color: '#ed6c02'
    },
    {
      title: 'Urgentes',
      value: deliveries.filter(d => d.deliveryUrgent).length,
      icon: <Warning />,
      color: '#d32f2f'
    }
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
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Toutes les Livraisons" icon={<LocalShipping />} iconPosition="start" sx={{ m: 'auto'}}/>
          <Tab label="Statistiques d'Abus Urgent" icon={<Assessment />} iconPosition="start" sx={{ m: 'auto'}}/>
        </Tabs>
      </Paper>

      {tabValue === 0 ? (
        <>
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

          <Card>
            <CardContent>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Hôpital Demandeur</TableCell>
                      <TableCell>Centre de Don</TableCell>
                      <TableCell>Type Sanguin</TableCell>
                      <TableCell>Quantité</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Priorité</TableCell>
                      <TableCell>Date Demande</TableCell>
                      <TableCell>Date Validation</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.deliveryId}>
                        <TableCell>#{delivery.deliveryId}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LocalHospital sx={{ mr: 1, fontSize: 16 }} />
                            {delivery.hospitalName || `ID: ${delivery.hospitalId}`}
                          </Box>
                        </TableCell>
                        <TableCell>{delivery.centerCity || `ID: ${delivery.centerId}`}</TableCell>
                        <TableCell>
                          <Chip 
                            label={delivery.bloodType || 'Non spécifié'} 
                            color={getBloodTypeColor(delivery.bloodType) as 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning'}
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${delivery.bloodQuantity || 1} poche${(delivery.bloodQuantity || 1) > 1 ? 's' : ''}`}
                            color="info" 
                            size="small" 
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(delivery.deliveryStatus)}
                            label={getStatusLabel(delivery.deliveryStatus)}
                            color={getStatusColor(delivery.deliveryStatus) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                            variant={getStatusVariant(delivery.deliveryStatus) as 'filled' | 'outlined'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={delivery.deliveryUrgent ? <Warning /> : <CheckCircle />}
                            label={delivery.deliveryUrgent ? "URGENT" : "Normal"} 
                            color={delivery.deliveryUrgent ? "error" : "success"} 
                            size="small"
                            variant={delivery.deliveryUrgent ? "filled" : "outlined"}
                            sx={{ 
                              fontWeight: delivery.deliveryUrgent ? 'bold' : 'normal',
                              animation: delivery.deliveryUrgent ? 'pulse 2s infinite' : 'none',
                              '@keyframes pulse': {
                                '0%': { opacity: 1 },
                                '50%': { opacity: 0.7 },
                                '100%': { opacity: 1 }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {delivery.dteDelivery ? new Date(delivery.dteDelivery).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell>
                          {delivery.dteValidation ? new Date(delivery.dteValidation).toLocaleDateString('fr-FR') : '-'}
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
        </>
      ) : (
        /* Tab Statistiques d'Abus */
        <Box>
          <Alert severity="warning" sx={{ mb: 3, '& .MuiAlert-message': { width: '100%' } }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1rem' }}>
                📊 Critères de Détection d'Abus Urgent
              </div>
              <div style={{ textAlign: 'left', display: 'inline-block', fontSize: '0.875rem' }}>
                <strong>Seuil d'alerte :</strong> Plus de 50% de demandes urgentes<br/>
                <strong>Minimum requis :</strong> Au moins 10 livraisons effectuées<br/>
                <strong>Indicateurs visuels :</strong> Les hôpitaux abusifs apparaissent en rouge avec l'icône ⚠️<br/>
                <strong>Action recommandée :</strong> Contactez les hôpitaux signalés pour vérifier la justification
              </div>
            </div>
          </Alert>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Détail par Hôpital
              </Typography>
              
              <List>
                {hospitalStats.map((stat) => (
                  <ListItem 
                    key={stat.hospitalId}
                    sx={{ 
                      borderLeft: stat.isAbusing ? '4px solid #f44336' : '4px solid #4caf50',
                      mb: 1,
                      backgroundColor: stat.isAbusing ? 'rgba(244, 67, 54, 0.05)' : 'transparent'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocalHospital />
                          <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                            {stat.hospitalName}
                          </span>
                          {stat.isAbusing && (
                            <Chip 
                              icon={<ReportProblem />} 
                              label="Abus détecté" 
                              color="error" 
                              size="small" 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box component="div">
                          <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', marginBottom: '8px' }}>
                            {stat.urgentDeliveries} livraisons urgentes sur {stat.totalDeliveries} total
                          </div>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={stat.urgentPercentage} 
                              sx={{ 
                                flexGrow: 1, 
                                mr: 2,
                                height: 8,
                                backgroundColor: 'grey.300',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: stat.isAbusing ? '#f44336' : '#4caf50'
                                }
                              }}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                              {stat.urgentPercentage.toFixed(1)}%
                            </span>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {stat.isAbusing && (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          startIcon={<Warning />}
                        >
                          Signaler
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              {hospitalStats.length === 0 && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Aucune donnée de livraison disponible
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default SuperAdminDeliveryManagement;