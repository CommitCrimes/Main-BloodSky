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
  Menu, MenuItem, ListItemIcon, ListItemText
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
  CheckCircleOutline, BuildCircleOutlined, PowerSettingsNewOutlined
} from '@mui/icons-material';
import DroneDetailView from './DroneDetailView';
import { dronesApi } from '@/api/drone';
import type { FlightInfo as DroneFlightInfo } from '@/types/drone';
import type { DroneHistory } from '@/types/delivery';
import type { DroneStatus } from '@/types/drone';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const toFixedOrNA = (v: unknown, d = 0) => (isNum(v) ? (v as number).toFixed(d) : 'N/A');
const percentOrNA = (v: unknown) => (isNum(v) ? `${(v as number).toFixed(0)}%` : 'N/A');

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
  type DroneStatusValue = 'available' | 'maintenance' | 'hors service';
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusMenuDroneId, setStatusMenuDroneId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const openStatusMenu = Boolean(statusMenuAnchor);

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

  const handleOpenStatusMenu = (e: React.MouseEvent<HTMLElement>, droneId: number) => {
  setStatusMenuAnchor(e.currentTarget);
  setStatusMenuDroneId(droneId);
};

const handleCloseStatusMenu = () => {
  setStatusMenuAnchor(null);
  setStatusMenuDroneId(null);
};

const applyDroneStatus = async (newStatus: DroneStatusValue) => {
  if (statusMenuDroneId == null) return;
  try {
    setUpdatingStatusId(statusMenuDroneId);
    await dronesApi.update(statusMenuDroneId, { droneStatus: newStatus });
    await fetchDronesData();
  } catch (err) {
    console.error('Error updating drone status:', err);
    setError(`Erreur lors de la mise à jour du statut du drone ${statusMenuDroneId}`);
  } finally {
    setUpdatingStatusId(null);
    handleCloseStatusMenu();
  }
};


  useEffect(() => {
    if (dronesHistory.length === 0) return;
    if (detailViewDroneId) return; // pause
    fetchAllDronesFlightInfo();
    const id = setInterval(fetchAllDronesFlightInfo, 3000);
    return () => clearInterval(id);
  }, [dronesHistory, detailViewDroneId]);

  const tStatus = (status?: string | null) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'available':
        return 'actif ';
      case 'maintenance':
        return 'Maintenance';
      case 'hors service':
        return 'Hors service';
    }
  };
  const getStatusColor = (status: string): string => {
    switch ((status || '').toLowerCase()) {
      case 'available':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      case 'hors service':
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

  const batteryValues = Object.values(dronesFlightInfo)
    .map((fi) => (isNum(fi?.battery_remaining_percent) ? fi!.battery_remaining_percent! : null))
    .filter((v): v is number => v !== null);

  const avgBattery = batteryValues.length
    ? Math.round(batteryValues.reduce((a, b) => a + b, 0) / batteryValues.length)
    : 0;


  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Menu anchorEl={statusMenuAnchor} open={openStatusMenu} onClose={handleCloseStatusMenu}>
  <MenuItem onClick={() => applyDroneStatus('available')}>
    <ListItemIcon><CheckCircleOutline fontSize="small" /></ListItemIcon>
    <ListItemText>Actif</ListItemText>
  </MenuItem>
  <MenuItem onClick={() => applyDroneStatus('maintenance')}>
    <ListItemIcon><BuildCircleOutlined fontSize="small" /></ListItemIcon>
    <ListItemText>Maintenance</ListItemText>
  </MenuItem>
  <MenuItem onClick={() => applyDroneStatus('hors service')}>
    <ListItemIcon><PowerSettingsNewOutlined fontSize="small" /></ListItemIcon>
    <ListItemText>Hors service</ListItemText>
  </MenuItem>
</Menu>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
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
                    {uniqueDrones.filter((d) => dronesFlightInfo[d.droneId]?.is_armed === true).length}
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
                    {uniqueDrones.filter((d) => {
                      const fi = dronesFlightInfo[d.droneId];
                      return fi?.state === 'flying' || fi?.is_armed === true;
                    }).length}
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
      {/* Version Desktop */}
      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
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
              const isOffline = !!(fi?.unavailable || fi?.state === 'offline');

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
  clickable
  onClick={(e) => handleOpenStatusMenu(e, drone.droneId)}
  label={
    updatingStatusId === drone.droneId
      ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={14} />
          <span>{tStatus(drone.droneStatus) || 'N/A'}</span>
        </Box>
      )
      : (tStatus(drone.droneStatus) || 'N/A')
  }
  size="small"
  sx={{ backgroundColor: getStatusColor(drone.droneStatus), color: '#fff', fontSize: '0.7rem' }}
/>

</TableCell>

                  {/* État */}
                  <TableCell>
                    {fi?.unavailable || fi?.state === 'offline' ? (
                      <Chip label="OFFLINE" size="small" variant="outlined" />
                    ) : fi?.is_armed === true ? (
                      <Chip label="ARMÉ" size="small" color="error" variant="outlined" />
                    ) : fi?.is_armed === false ? (
                      <Chip label="DÉSARMÉ" size="small" variant="outlined" />
                    ) : (
                      <Chip label="N/A" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{fi?.flight_mode || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {percentOrNA(fi?.battery_remaining_percent)}
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
                      <Tooltip title={isOffline ? "Détails indisponibles (OFFLINE)" : "Détails"}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => setDetailViewDroneId(drone.droneId)}
                            disabled={isOffline}
                          >
                            <Visibility />
                          </IconButton>
                        </span>
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

      {/* Version Mobile avec Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {uniqueDrones.map((drone) => {
          const statusItem: DroneStatus | undefined = dronesStatus.find((s) => s.droneId === drone.droneId);
          const fi = dronesFlightInfo[drone.droneId];
          const isOnline = statusItem?.isOnline || false;
          const isArmed = fi?.is_armed === true;
          const flightMode = fi?.flight_mode || 'N/A';

          return (
            <Card key={drone.droneId} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', fontSize: '1.1rem' }}>
                      {drone.droneName || 'Sans nom'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {drone.droneId}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={tStatus(drone.droneStatus) || 'N/A'}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(drone.droneStatus),
                        color: '#fff',
                        fontSize: '0.7rem'
                      }}
                    />
                    {isOnline && (
                      <Chip
                        label="En ligne"
                        size="small"
                        sx={{ backgroundColor: '#4caf50', color: '#fff', fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">État</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace' }}>
                      {isArmed ? 'Armé' : 'Désarmé'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Mode</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace' }}>
                      {flightMode}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Batterie</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace' }}>
                      {percentOrNA(fi?.battery_remaining_percent)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Centre</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', fontSize: '0.85rem' }}>
                      {drone.centerCity || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="Voir les détails">
                    <IconButton 
                      size="small" 
                      onClick={() => setDetailViewDroneId(drone.droneId)}
                      sx={{ border: '1px solid #e0e0e0' }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Synchroniser">
                    <IconButton 
                      size="small" 
                      onClick={() => handleSyncDrone(drone.droneId)}
                      disabled={syncing === drone.droneId || !isOnline}
                      sx={{ border: '1px solid #e0e0e0' }}
                    >
                      {syncing === drone.droneId ? (
                        <CircularProgress size={18} />
                      ) : (
                        <SyncOutlined fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Retour base">
                    <IconButton 
                      size="small" 
                      onClick={() => handleReturnHome(drone.droneId)}
                      disabled={!isOnline || !isArmed}
                      sx={{ border: '1px solid #e0e0e0' }}
                    >
                      <HomeOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Infos">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedDrone(drone);
                        setDialogOpen(true);
                      }}
                      sx={{ border: '1px solid #e0e0e0' }}
                    >
                      <NavigationOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Dialog infos drone */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 2, sm: 4 },
            width: { xs: '100%', sm: 'auto' }
          }
        }}
      >
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
                    <strong>Armé:</strong>{' '}
                    {dronesFlightInfo[selectedDrone.droneId]?.is_armed === true
                      ? 'Oui'
                      : dronesFlightInfo[selectedDrone.droneId]?.is_armed === false
                        ? 'Non'
                        : 'N/A'}
                  </Typography>

                  {dronesFlightInfo[selectedDrone.droneId] && (
                    <>
                      <Typography>
                        <strong>Latitude:</strong> {toFixedOrNA(dronesFlightInfo[selectedDrone.droneId]?.latitude, 6)}
                      </Typography>
                      <Typography>
                        <strong>Longitude:</strong> {toFixedOrNA(dronesFlightInfo[selectedDrone.droneId]?.longitude, 6)}
                      </Typography>
                      <Typography>
                        <strong>Altitude:</strong> {toFixedOrNA(dronesFlightInfo[selectedDrone.droneId]?.altitude_m, 1)} m
                      </Typography>
                      <Typography>
                        <strong>Vitesse:</strong> {toFixedOrNA(dronesFlightInfo[selectedDrone.droneId]?.horizontal_speed_m_s, 1)} m/s
                      </Typography>
                      <Typography>
                        <strong>Direction:</strong> {toFixedOrNA(dronesFlightInfo[selectedDrone.droneId]?.heading_deg, 0)}°
                      </Typography>
                      <Typography>
                        <strong>Déplacement:</strong> {toFixedOrNA(dronesFlightInfo[selectedDrone.droneId]?.movement_track_deg, 0)}°
                      </Typography>
                      <Typography>
                        <strong>Batterie:</strong> {percentOrNA(dronesFlightInfo[selectedDrone.droneId]?.battery_remaining_percent)}
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
