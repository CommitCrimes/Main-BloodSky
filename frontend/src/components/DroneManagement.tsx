import React, { useState, useEffect, useMemo } from 'react';
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
  NavigationOutlined,
  SyncOutlined,
  EditOutlined,
  FlightOutlined,
  HomeOutlined,
  RefreshOutlined,
  Visibility,
} from '@mui/icons-material';
import DroneDetailView from './DroneDetailView';
import { dronesApi } from '@/api/drone';
import type { FlightInfo as DroneFlightInfo } from '@/types/drone';
import type { DroneHistory } from '@/types/delivery';
import type { DroneStatus } from '@/types/drone';

const DroneManagement: React.FC = () => {
  const [dronesHistory, setDronesHistory] = useState<DroneHistory[]>([]);
  const [dronesStatus, setDronesStatus] = useState<DroneStatus[]>([]);
  const [dronesFlightInfo, setDronesFlightInfo] = useState<Record<number, DroneFlightInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<DroneHistory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [detailViewDroneId, setDetailViewDroneId] = useState<number | null>(null);

  const fetchDronesData = async () => {
    try {
      setLoading(true);

      // Ces méthodes sont déjà filtrées côté api/drone.ts
      const historyData = await dronesApi.getHistory();
      const rawStatus = await dronesApi.getStatus();

      const statusData = Array.isArray(rawStatus) ? (rawStatus as DroneStatus[]) : [];

      setDronesHistory(historyData as unknown as DroneHistory[]);
      setDronesStatus(statusData);
      setError(null);
    } catch (err) {
      console.error('Error fetching drones data:', err);
      setError('Erreur lors du chargement des données des drones');
    } finally {
      setLoading(false);
    }
  };

  const fetchDroneFlightInfo = async (droneId: number) => {
    try {
      return await dronesApi.getFlightInfo(droneId);
    } catch {
      return null;
    }
  };

  const fetchAllDronesFlightInfo = async () => {
    // Grouper par droneId
    const grouped = dronesHistory.reduce<Record<number, DroneHistory>>((acc, row) => {
      if (!acc[row.droneId]) acc[row.droneId] = row;
      return acc;
    }, {});

    const ids = Object.keys(grouped)
      .map((s) => parseInt(s, 10))

    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const fi = await fetchDroneFlightInfo(id);
        return { id, fi };
      })
    );

    const next: Record<number, DroneFlightInfo> = {};
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.fi) {
        next[r.value.id] = r.value.fi;
      }
    }
    setDronesFlightInfo(next);
  };

  const handleSyncDrone = async (droneId: number) => {
    try {
      setSyncing(droneId);
      await dronesApi.sync(droneId);
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
      // utilise l’endpoint de commande RTL défini dans api/drone.ts
      await dronesApi.returnHome(droneId);
      await fetchDronesData();
    } catch (err) {
      console.error('Error returning drone home:', err);
      setError(`Erreur lors du retour du drone ${droneId} à la base`);
    }
  };

  useEffect(() => {
    fetchDronesData();
  }, []);

  useEffect(() => {
  if (dronesHistory.length === 0) return;
  if (detailViewDroneId) return; // pause
  fetchAllDronesFlightInfo();
  const id = setInterval(fetchAllDronesFlightInfo, 5000);
  return () => clearInterval(id);
}, [dronesHistory, detailViewDroneId]);


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
      minute: '2-digit',
    });
  };

  // Mémos pour éviter de recalculer à chaque render
  const groupedDrones = useMemo(() => {
    const acc: Record<number, DroneHistory> = {};
    for (const row of dronesHistory) {
      if (!row || typeof row.droneId !== 'number') continue;
      if (!acc[row.droneId]) {
        acc[row.droneId] = { ...row, deliveries: [] };
      }
      if (row.deliveryId) {
        acc[row.droneId].deliveries!.push({
          deliveryId: row.deliveryId,
          deliveryStatus: row.deliveryStatus,
          deliveryUrgent: row.deliveryUrgent,
          dteDelivery: row.dteDelivery,
          dteValidation: row.dteValidation,
          hospitalName: row.hospitalName,
          hospitalCity: row.hospitalCity,
        });
      }
    }
    return acc;
  }, [dronesHistory]);

  const uniqueDrones = useMemo(
    () => Object.values(groupedDrones),
    [groupedDrones]
  );


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (detailViewDroneId) {
    return <DroneDetailView droneId={detailViewDroneId} onBack={() => setDetailViewDroneId(null)} />;
  }

  const avgBattery =
    Math.round(
      (Object.values(dronesFlightInfo).reduce((acc, info) => acc + (info?.battery_remaining_percent || 0), 0) /
        Math.max(Object.keys(dronesFlightInfo).length, 1)) * 1
    ) || 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
          Gestion des Drones
        </Typography>
        <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={fetchDronesData} disabled={loading}>
          Actualiser
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overview */}
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
                    {dronesStatus.filter((d) => d.isOnline).length}
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
                    {uniqueDrones.filter((d) => !!dronesFlightInfo[d.droneId]?.is_armed).length}
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
                    {uniqueDrones.filter((d) => !!dronesFlightInfo[d.droneId]?.is_armed).length}
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
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {avgBattery}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Batterie moy.
                  </Typography>
                </Box>
                <NavigationOutlined sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Mode de vol</TableCell>
              <TableCell>Batterie</TableCell>
              <TableCell>Centre</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uniqueDrones.map((drone) => {
              const status = dronesStatus.find((s) => s.droneId === drone.droneId);
              const fi = dronesFlightInfo[drone.droneId];

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
                          backgroundColor: status?.isOnline ? '#4caf50' : '#f44336',
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
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={fi?.is_armed ? 'ARMÉ' : 'DÉSARMÉ'}
                      size="small"
                      color={fi?.is_armed ? 'error' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{fi?.flight_mode || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {typeof fi?.battery_remaining_percent === 'number'
                        ? `${fi.battery_remaining_percent.toFixed(0)}%`
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{drone.centerCity || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Synchroniser">
                        <IconButton size="small" onClick={() => handleSyncDrone(drone.droneId)} disabled={syncing === drone.droneId}>
                          {syncing === drone.droneId ? <CircularProgress size={16} /> : <SyncOutlined />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Retour à la base">
                        <IconButton size="small" onClick={() => handleReturnHome(drone.droneId)} disabled={!fi?.is_armed}>
                          <HomeOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Détails">
                        <IconButton size="small" onClick={() => setDetailViewDroneId(drone.droneId)}>
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

      {/* Dialog infos drone */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Détails du Drone {selectedDrone?.droneId}</DialogTitle>
        <DialogContent>
          {selectedDrone && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="h6" gutterBottom>
                    Informations générales
                  </Typography>
                  <Typography>
                    <strong>Nom:</strong> {selectedDrone.droneName || 'Sans nom'}
                  </Typography>
                  <Typography>
                    <strong>Statut:</strong> {selectedDrone.droneStatus || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Mode de vol:</strong> {dronesFlightInfo[selectedDrone.droneId]?.flight_mode || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Armé:</strong> {dronesFlightInfo[selectedDrone.droneId]?.is_armed ? 'Oui' : 'Non'}
                  </Typography>
                  {dronesFlightInfo[selectedDrone.droneId] && (
                    <>
                      <Typography>
                        <strong>Latitude:</strong>{' '}
                        {dronesFlightInfo[selectedDrone.droneId].latitude.toFixed(6)}
                      </Typography>
                      <Typography>
                        <strong>Longitude:</strong>{' '}
                        {dronesFlightInfo[selectedDrone.droneId].longitude.toFixed(6)}
                      </Typography>
                      <Typography>
                        <strong>Altitude:</strong>{' '}
                        {dronesFlightInfo[selectedDrone.droneId].altitude_m.toFixed(1)} m
                      </Typography>
                      <Typography>
                        <strong>Vitesse:</strong>{' '}
                        {dronesFlightInfo[selectedDrone.droneId].horizontal_speed_m_s.toFixed(1)} m/s
                      </Typography>
                      <Typography>
                        <strong>Direction:</strong>{' '}
                        {dronesFlightInfo[selectedDrone.droneId].heading_deg?.toFixed(0) || 'N/A'}°
                      </Typography>
                      <Typography>
                        <strong>Déplacement:</strong>{' '}
                        {dronesFlightInfo[selectedDrone.droneId].movement_track_deg?.toFixed(0) || 'N/A'}°
                      </Typography>
                      <Typography>
                        <strong>Batterie:</strong>{' '}
                        {dronesFlightInfo[selectedDrone.droneId].battery_remaining_percent?.toFixed(0) || 'N/A'}%
                      </Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="h6" gutterBottom>
                    Historique des livraisons
                  </Typography>
                  {selectedDrone.deliveries && selectedDrone.deliveries.length > 0 ? (
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {selectedDrone.deliveries.map((delivery, index) => (
                        <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Livraison #{delivery.deliveryId}</strong>
                          </Typography>
                          <Typography variant="body2">
                            Destination: {delivery.hospitalName}, {delivery.hospitalCity}
                          </Typography>
                          <Typography variant="body2">Statut: {delivery.deliveryStatus}</Typography>
                          <Typography variant="body2">Date: {formatDate(delivery.dteDelivery)}</Typography>
                          {delivery.deliveryUrgent && <Chip label="URGENT" size="small" color="error" />}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">Aucune livraison enregistrée</Typography>
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
