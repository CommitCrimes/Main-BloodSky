import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  FlightTakeoffOutlined,
  BatteryFullOutlined,
  NavigationOutlined,
  SyncOutlined,
  EditOutlined,
  FlightOutlined,
  HomeOutlined,
  RefreshOutlined,
  Visibility
} from '@mui/icons-material';
import DroneDetailView from './DroneDetailView';

interface DroneDelivery {
  deliveryId: number;
  deliveryStatus: string;
  deliveryUrgent: boolean;
  dteDelivery: string;
  dteValidation: string;
  hospitalName: string;
  hospitalCity: string;
}

interface DroneHistory {
  droneId: number;
  droneName: string;
  droneBattery: string;
  droneStatus: string;
  missionStatus: string;
  flightMode: string;
  isArmed: boolean;
  createdAt: string;
  lastSyncAt: string;
  deliveryId: number;
  deliveryStatus: string;
  deliveryUrgent: boolean;
  dteDelivery: string;
  dteValidation: string;
  hospitalName: string;
  hospitalCity: string;
  centerCity: string;
  deliveries?: DroneDelivery[];
}

interface DroneStatus {
  droneId: number;
  isOnline: boolean;
  lastSyncAt: string;
  apiUrl: string;
  apiId: number;
}

const DroneManagement: React.FC = () => {
  const [dronesHistory, setDronesHistory] = useState<DroneHistory[]>([]);
  const [dronesStatus, setDronesStatus] = useState<DroneStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<DroneHistory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [detailViewDroneId, setDetailViewDroneId] = useState<number | null>(null);

  const fetchDronesData = async () => {
    try {
      setLoading(true);
      
      // Fetch drones history
      const historyResponse = await fetch('http://localhost:3000/api/drones/history');
      if (!historyResponse.ok) throw new Error('Failed to fetch drones history');
      const historyData = await historyResponse.json();
      
      // Fetch drones status
      const statusResponse = await fetch('http://localhost:3000/api/drones/status');
      if (!statusResponse.ok) throw new Error('Failed to fetch drones status');
      const statusData = await statusResponse.json();
      
      setDronesHistory(historyData);
      setDronesStatus(statusData);
      setError(null);
    } catch (err) {
      console.error('Error fetching drones data:', err);
      setError('Erreur lors du chargement des données des drones');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDrone = async (droneId: number) => {
    try {
      setSyncing(droneId);
      const response = await fetch(`http://localhost:3000/api/drones/${droneId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sync failed');
      }
      
      // Refresh data after sync
      await fetchDronesData();
    } catch (err) {
      console.error('Error syncing drone:', err);
      setError(`Erreur lors de la synchronisation du drone ${droneId}`);
    } finally {
      setSyncing(null);
    }
  };

  const handleReturnHome = async (droneId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/drones/${droneId}/return-home`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Return home failed');
      }
      
      await fetchDronesData();
    } catch (err) {
      console.error('Error returning drone home:', err);
      setError(`Erreur lors du retour du drone ${droneId} à la base`);
    }
  };

  useEffect(() => {
    fetchDronesData();
  }, []);

  const getBatteryColor = (battery: string): string => {
    const percentage = parseInt(battery?.replace('%', '') || '0');
    if (percentage > 60) return '#4caf50';
    if (percentage > 30) return '#ff9800';
    return '#f44336';
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'flying':
        return '#4caf50';
      case 'charging':
      case 'standby':
        return '#ff9800';
      case 'maintenance':
      case 'error':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return 'Jamais';
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Maintenant';
    if (minutes < 60) return `${minutes}min`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}j`;
  };

  // Group drones by ID and get the latest delivery info
  const groupedDrones = dronesHistory.reduce((acc: Record<number, DroneHistory>, drone) => {
    if (!acc[drone.droneId]) {
      acc[drone.droneId] = {
        ...drone,
        deliveries: []
      };
    }
    if (drone.deliveryId) {
      acc[drone.droneId].deliveries!.push({
        deliveryId: drone.deliveryId,
        deliveryStatus: drone.deliveryStatus,
        deliveryUrgent: drone.deliveryUrgent,
        dteDelivery: drone.dteDelivery,
        dteValidation: drone.dteValidation,
        hospitalName: drone.hospitalName,
        hospitalCity: drone.hospitalCity
      });
    }
    return acc;
  }, {});

  const uniqueDrones = Object.values(groupedDrones);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show detail view if a drone is selected
  if (detailViewDroneId) {
    return (
      <DroneDetailView
        droneId={detailViewDroneId}
        onBack={() => setDetailViewDroneId(null)}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
          Gestion des Drones
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={fetchDronesData}
          disabled={loading}
        >
          Actualiser
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Drones Overview Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary">
                    {uniqueDrones.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Drones Total
                  </Typography>
                </Box>
                <FlightTakeoffOutlined sx={{ fontSize: 40, color: '#5C7F9B' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {dronesStatus.filter(d => d.isOnline).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En ligne
                  </Typography>
                </Box>
                <SyncOutlined sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {uniqueDrones.filter(d => d.isArmed).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Armés
                  </Typography>
                </Box>
                <FlightOutlined sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {uniqueDrones.filter(d => d.missionStatus === 'ACTIVE').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En mission
                  </Typography>
                </Box>
                <NavigationOutlined sx={{ fontSize: 40, color: '#2196f3' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Drones Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Batterie</TableCell>
              <TableCell>Mission</TableCell>
              <TableCell>Mode de vol</TableCell>
              <TableCell>Dernière sync</TableCell>
              <TableCell>Centre</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uniqueDrones.map((drone) => {
              const status = dronesStatus.find(s => s.droneId === drone.droneId);
              return (
                <TableRow key={drone.droneId}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {drone.droneId}
                      </Typography>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: status?.isOnline ? '#4caf50' : '#f44336'
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {drone.droneName || 'Sans nom'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={drone.droneStatus || 'UNKNOWN'}
                      size="small"
                      sx={{ 
                        backgroundColor: getStatusColor(drone.droneStatus),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {drone.droneBattery ? (
                        <>
                          <BatteryFullOutlined 
                            sx={{ 
                              color: getBatteryColor(drone.droneBattery),
                              fontSize: 16
                            }} 
                          />
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: getBatteryColor(drone.droneBattery),
                              fontWeight: 'bold'
                            }}
                          >
                            {drone.droneBattery}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={drone.missionStatus || 'IDLE'}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: drone.missionStatus === 'ACTIVE' ? '#4caf50' : '#9e9e9e',
                        color: drone.missionStatus === 'ACTIVE' ? '#4caf50' : '#9e9e9e'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {drone.flightMode || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatTimeAgo(drone.lastSyncAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {drone.centerCity || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Synchroniser">
                        <IconButton
                          size="small"
                          onClick={() => handleSyncDrone(drone.droneId)}
                          disabled={syncing === drone.droneId}
                        >
                          {syncing === drone.droneId ? (
                            <CircularProgress size={16} />
                          ) : (
                            <SyncOutlined />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Retour à la base">
                        <IconButton
                          size="small"
                          onClick={() => handleReturnHome(drone.droneId)}
                          disabled={!drone.isArmed}
                        >
                          <HomeOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Détails">
                        <IconButton
                          size="small"
                          onClick={() => setDetailViewDroneId(drone.droneId)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Informations">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedDrone(drone);
                            setDialogOpen(true);
                          }}
                        >
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Drone Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Détails du Drone {selectedDrone?.droneId}
        </DialogTitle>
        <DialogContent>
          {selectedDrone && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="h6" gutterBottom>
                    Informations générales
                  </Typography>
                  <Typography><strong>Nom:</strong> {selectedDrone.droneName || 'Sans nom'}</Typography>
                  <Typography><strong>Statut:</strong> {selectedDrone.droneStatus || 'N/A'}</Typography>
                  <Typography><strong>Batterie:</strong> {selectedDrone.droneBattery || 'N/A'}</Typography>
                  <Typography><strong>Mode de vol:</strong> {selectedDrone.flightMode || 'N/A'}</Typography>
                  <Typography><strong>Armé:</strong> {selectedDrone.isArmed ? 'Oui' : 'Non'}</Typography>
                  <Typography><strong>Mission:</strong> {selectedDrone.missionStatus || 'IDLE'}</Typography>
                  <Typography><strong>Créé le:</strong> {formatDate(selectedDrone.createdAt)}</Typography>
                  <Typography><strong>Dernière sync:</strong> {formatDate(selectedDrone.lastSyncAt)}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="h6" gutterBottom>
                    Historique des livraisons
                  </Typography>
                  {selectedDrone.deliveries && selectedDrone.deliveries.length > 0 ? (
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {selectedDrone.deliveries.map((delivery: DroneDelivery, index: number) => (
                        <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Livraison #{delivery.deliveryId}</strong>
                          </Typography>
                          <Typography variant="body2">
                            Destination: {delivery.hospitalName}, {delivery.hospitalCity}
                          </Typography>
                          <Typography variant="body2">
                            Statut: {delivery.deliveryStatus}
                          </Typography>
                          <Typography variant="body2">
                            Date: {formatDate(delivery.dteDelivery)}
                          </Typography>
                          {delivery.deliveryUrgent && (
                            <Chip label="URGENT" size="small" color="error" />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      Aucune livraison enregistrée
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DroneManagement;