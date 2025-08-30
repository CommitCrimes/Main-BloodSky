import React, { useState, useEffect, useMemo } from "react";

const commonStyles = {
  gradientText: {
    background: 'linear-gradient(45deg, #981A0E, #C41E3A)',
    backgroundClip: 'text' as const,
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
  },
};
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
  TextField,
  Menu, MenuItem, ListItemIcon, ListItemText
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import {
  FlightTakeoffOutlined,
  NavigationOutlined,
  SyncOutlined,
  EditOutlined,
  FlightOutlined,
  HomeOutlined,
  RefreshOutlined,
  Visibility,
  Add,
  Delete,
  CheckCircleOutline, BuildCircleOutlined, PowerSettingsNewOutlined
} from "@mui/icons-material";
import DroneDetailView from "./DroneDetailView";
import { dronesApi } from "@/api/drone";
import { api } from "@/api/api";

interface DonationCenter {
  centerId: number;
  centerCity: string;
  centerAdress: string;
}
import type { FlightInfo as DroneFlightInfo } from "@/types/drone";
import type { DroneHistory } from "@/types/delivery";
import type { DroneStatus } from "@/types/drone";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "date-fns";

const AdminDroneManagement: React.FC = () => {
  type DroneStatusValue = 'available' | 'maintenance' | 'hors service';
  const [dronesHistory, setDronesHistory] = useState<DroneHistory[]>([]);
  const [dronesStatus, setDronesStatus] = useState<DroneStatus[]>([]);
  const [dronesFlightInfo, setDronesFlightInfo] = useState<
    Record<number, DroneFlightInfo>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<DroneHistory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [detailViewDroneId, setDetailViewDroneId] = useState<number | null>(
    null
  );
  const auth = useAuth();
  const isSuperAdmin = auth.user?.role?.type === "super_admin";
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ droneName: "", centerId: "" });
  const [creating, setCreating] = useState(false);
  const [nextDroneId, setNextDroneId] = useState<number | null>(null);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [centerOptions, setCenterOptions] = useState<DonationCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(
    null
  );
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusMenuDroneId, setStatusMenuDroneId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const openStatusMenu = Boolean(statusMenuAnchor);



  const isDroneOffline = (droneId: number) => {
    const status = dronesStatus.find((s) => s.droneId === droneId);
    const fi = dronesFlightInfo[droneId];
    return !status?.isOnline || !!fi?.unavailable || fi?.state === "offline";
  };

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



  const fetchDronesData = async () => {
    try {
      setLoading(true);

      // Ces méthodes sont déjà filtrées côté api/drone.ts
      const historyData = await dronesApi.getHistory();
      const rawStatus = await dronesApi.getStatus();

      const statusData = Array.isArray(rawStatus)
        ? (rawStatus as DroneStatus[])
        : [];

      setDronesHistory(historyData as unknown as DroneHistory[]);
      setDronesStatus(statusData);
      setError(null);
    } catch (err) {
      console.error("Error fetching drones data:", err);
      setError("Erreur lors du chargement des données des drones");
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
    const grouped = dronesHistory.reduce<Record<number, DroneHistory>>(
      (acc, row) => {
        if (!acc[row.droneId]) acc[row.droneId] = row;
        return acc;
      },
      {}
    );

    const ids = Object.keys(grouped).map((s) => parseInt(s, 10));

    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const fi = await fetchDroneFlightInfo(id);
        return { id, fi };
      })
    );

    const next: Record<number, DroneFlightInfo> = {};
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.fi) {
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
      console.error("Error syncing drone:", err);
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
      console.error("Error returning drone home:", err);
      setError(`Erreur lors du retour du drone ${droneId} à la base`);
    }
  };

  const handleOpenCreateDialog = async () => {
    try {
      const list = await dronesApi.list();
      const maxId = list.reduce((m, d) => Math.max(m, d.droneId), 0);
      setNextDroneId(maxId + 1);
    } catch (err) {
      console.error("Error fetching next drone id:", err);
      setNextDroneId(null);
    }
    setCreateDialogOpen(true);
  };

  const fetchCityOptions = async (value: string) => {
    if (!value) {
      setCityOptions([]);
      return;
    }
    try {
      const res = await api.get(`/donation-centers/city/${value}`);
      const centers = res.data as DonationCenter[];
      const cities = Array.from(new Set(centers.map((c) => c.centerCity)));
      setCityOptions(cities);
    } catch (err) {
      console.error("Error fetching city options:", err);
      setCityOptions([]);
    }
  };

  const fetchCentersByCity = async (city: string) => {
    if (!city) {
      setCenterOptions([]);
      return;
    }
    try {
      const res = await api.get(`/donation-centers/city/${city}`);
      setCenterOptions(res.data as DonationCenter[]);
    } catch (err) {
      console.error("Error fetching centers:", err);
      setCenterOptions([]);
    }
  };

  const handleCreateDrone = async () => {
    try {
      setCreating(true);
      await dronesApi.create({
        droneName: createForm.droneName,
        centerId: createForm.centerId
          ? parseInt(createForm.centerId, 10)
          : null,
        droneImage: null,
        droneStatus: null,
      });
      setCreateDialogOpen(false);
      setCreateForm({ droneName: "", centerId: "" });
      setSelectedCity("");
      setCityInput("");
      setCenterOptions([]);
      setSelectedCenter(null);
      await fetchDronesData();
    } catch (err) {
      console.error("Error creating drone:", err);
      setError("Erreur lors de la création du drone");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDrone = async (droneId: number) => {
    if (!confirm(`Supprimer le drone ${droneId} ?`)) return;
    try {
      await dronesApi.remove(droneId);
      await fetchDronesData();
    } catch (err) {
      console.error("Error deleting drone:", err);
      setError(`Erreur lors de la suppression du drone ${droneId}`);
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

  const tStatus = (status?: string | null) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "available":
        return "Actif";
      case "maintenance":
        return "Maintenance";
      case "hors service":
        return "Hors service";
      default:
        return "N/A";
    }
  };

  const getStatusColor = (status?: string | null): string => {
    switch ((status || "").toLowerCase()) {
      case "available":
        return "#10b981"; // vert émeraude
      case "maintenance":
        return "#f59e0b"; // orange
      case "hors service":
        return "#f44336"; // rouge
      default:
        return "#9e9e9e"; // gris
    }
  };

  // Mémos pour éviter de recalculer à chaque render
  const groupedDrones = useMemo(() => {
    const acc: Record<number, DroneHistory> = {};
    for (const row of dronesHistory) {
      if (!row || typeof row.droneId !== "number") continue;
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (detailViewDroneId) {
    return (
      <DroneDetailView
        droneId={detailViewDroneId}
        onBack={() => setDetailViewDroneId(null)}
      />
    );
  }

  const avgBattery =
    Math.round(
      (Object.values(dronesFlightInfo).reduce(
        (acc, info) => acc + (info?.battery_remaining_percent || 0),
        0
      ) /
        Math.max(Object.keys(dronesFlightInfo).length, 1)) *
      1
    ) || 0;

  return (
    <Box sx={{
      px: { xs: 2, sm: 3, md: 4, lg: 5 },
      py: { xs: 2, sm: 3 },
      maxWidth: '1400px',
      mx: 'auto'
    }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'center', sm: "space-between" },
          alignItems: { xs: 'center', sm: "center" },
          gap: { xs: 2, sm: 0 },
          mb: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.8rem', sm: '2.2rem' },
            mb: 0.5,
            fontFamily: 'Iceland, cursive',
            ...commonStyles.gradientText,
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Gestion des Drones
        </Typography>
        <Box sx={{
          display: "flex",
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          {isSuperAdmin && (
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleOpenCreateDialog}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 0.75, sm: 1 },
                px: { xs: 1.5, sm: 2 }
              }}
            >
              Ajouter
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={fetchDronesData}
            disabled={loading}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.75, sm: 1 },
              px: { xs: 1.5, sm: 2 }
            }}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overview */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
          xl: 'repeat(5, 1fr)'
        },
        gap: { xs: 2, sm: 2.5, md: 3 },
        mb: { xs: 3, sm: 4 }
      }}>
        <Card sx={{
          border: '1px solid #e0e0e0',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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

              <Box>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 'bold'
                  }}
                >
                  {uniqueDrones.length}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Drones Total
                </Typography>
              </Box>
              <FlightTakeoffOutlined
                sx={{
                  fontSize: { xs: 30, sm: 35, md: 40 },
                  color: "#5C7F9B"
                }}
              />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{
          border: '1px solid #e0e0e0',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  color="success.main"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 'bold'
                  }}
                >
                  {dronesStatus.filter((d) => d.isOnline).length}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  En ligne
                </Typography>
              </Box>
              <SyncOutlined sx={{
                fontSize: { xs: 30, sm: 35, md: 40 },
                color: "#4caf50"
              }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{
          border: '1px solid #e0e0e0',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  color="warning.main"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 'bold'
                  }}
                >
                  {
                    uniqueDrones.filter(
                      (d) => !!dronesFlightInfo[d.droneId]?.is_armed
                    ).length
                  }
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Armés
                </Typography>
              </Box>
              <FlightOutlined sx={{
                fontSize: { xs: 30, sm: 35, md: 40 },
                color: "#ff9800"
              }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{
          border: '1px solid #e0e0e0',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  color="info.main"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 'bold'
                  }}
                >
                  {
                    uniqueDrones.filter(
                      (d) => !!dronesFlightInfo[d.droneId]?.is_armed
                    ).length
                  }
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  En mission
                </Typography>
              </Box>
              <NavigationOutlined sx={{
                fontSize: { xs: 30, sm: 35, md: 40 },
                color: "#2196f3"
              }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{
          border: '1px solid #e0e0e0',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  color="success.main"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 'bold'
                  }}
                >
                  {avgBattery}%
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Batterie moy.
                </Typography>
              </Box>
              <NavigationOutlined sx={{
                fontSize: { xs: 30, sm: 35, md: 40 },
                color: "#4caf50"
              }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Vue desktop - tableau */}
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <TableContainer
          component={Paper}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>État</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mode de vol</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Batterie</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Centre</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uniqueDrones.map((drone) => {
                const status = dronesStatus.find(
                  (s) => s.droneId === drone.droneId
                );
                const fi = dronesFlightInfo[drone.droneId];
                const offline = isDroneOffline(drone.droneId);

                return (
                  <TableRow key={drone.droneId} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {drone.droneId}
                        </Typography>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: status?.isOnline
                              ? "#4caf50"
                              : "#f44336",
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {drone.droneName || "Sans nom"}
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
                                <span>{tStatus(drone.droneStatus)}</span>
                              </Box>
                            )
                            : tStatus(drone.droneStatus)
                        }
                        size="small"
                        sx={{ backgroundColor: getStatusColor(drone.droneStatus), color: "#fff", fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>
                      {offline ? (
                        <Chip label="OFFLINE" size="small" variant="outlined" />
                      ) : fi?.is_armed ? (
                        <Chip label="ARMÉ" size="small" color="error" variant="outlined" />
                      ) : (
                        <Chip label="DÉSARMÉ" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {fi?.flight_mode || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {typeof fi?.battery_remaining_percent === "number"
                          ? `${fi.battery_remaining_percent.toFixed(0)}%`
                          : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {drone.centerCity || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title={offline ? "Drone offline" : "Synchroniser"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleSyncDrone(drone.droneId)}
                              disabled={syncing === drone.droneId || offline}
                            >
                              {syncing === drone.droneId ? <CircularProgress size={16} /> : <SyncOutlined />}
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={offline ? "Drone offline" : "Retour à la base"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleReturnHome(drone.droneId)}
                              disabled={offline || !fi?.is_armed}
                            >
                              <HomeOutlined />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={offline ? "Détails indisponibles (OFFLINE)" : "Détails"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => setDetailViewDroneId(drone.droneId)}
                              disabled={offline}
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

                        {isSuperAdmin && (
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteDrone(drone.droneId)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Vue mobile/tablet - cartes */}
      <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
        <Box sx={{
          display: 'grid',
          gap: { xs: 2, sm: 3 },
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
        }}>
          {uniqueDrones.map((drone) => {
            const status = dronesStatus.find(
              (s) => s.droneId === drone.droneId
            );
            const fi = dronesFlightInfo[drone.droneId];

            return (
              <Card
                key={drone.droneId}
                sx={{
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" sx={{
                          fontWeight: 'bold',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}>
                          Drone #{drone.droneId}
                        </Typography>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: status?.isOnline ? "#4caf50" : "#f44336",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {drone.centerCity || "N/A"}
                      </Typography>
                    </Box>

                    <Typography variant="subtitle1" sx={{
                      fontWeight: 'medium',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      mb: 1
                    }}>
                      {drone.droneName || "Sans nom"}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                        Statut
                      </Typography>
                      <Chip
                        label={tStatus(drone.droneStatus)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(drone.droneStatus),
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: '0.6rem',
                          height: 20
                        }}
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                        État
                      </Typography>
                      <Chip
                        label={fi?.is_armed ? "ARMÉ" : "DÉSARMÉ"}
                        size="small"
                        color={fi?.is_armed ? "error" : "default"}
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 20 }}
                      />
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                        Mode de vol
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {fi?.flight_mode || "N/A"}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                        Batterie
                      </Typography>
                      <Typography variant="body2" sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        fontWeight: 'bold',
                        color: typeof fi?.battery_remaining_percent === "number" && fi.battery_remaining_percent < 20 ? 'error.main' : 'text.primary'
                      }}>
                        {typeof fi?.battery_remaining_percent === "number"
                          ? `${fi.battery_remaining_percent.toFixed(0)}%`
                          : "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={0.5} justifyContent="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={syncing === drone.droneId ? <CircularProgress size={12} /> : <SyncOutlined />}
                      onClick={() => handleSyncDrone(drone.droneId)}
                      disabled={syncing === drone.droneId}
                      sx={{
                        fontSize: '0.65rem',
                        px: 1,
                        py: 0.5,
                        minWidth: 'auto'
                      }}
                    >
                      Sync
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<HomeOutlined />}
                      onClick={() => handleReturnHome(drone.droneId)}
                      disabled={!fi?.is_armed}
                      sx={{
                        fontSize: '0.65rem',
                        px: 1,
                        py: 0.5,
                        minWidth: 'auto'
                      }}
                    >
                      Base
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => setDetailViewDroneId(drone.droneId)}
                      sx={{
                        fontSize: '0.65rem',
                        px: 1,
                        py: 0.5,
                        minWidth: 'auto'
                      }}
                    >
                      Détails
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditOutlined />}
                      onClick={() => {
                        setSelectedDrone(drone);
                        setDialogOpen(true);
                      }}
                      sx={{
                        fontSize: '0.65rem',
                        px: 1,
                        py: 0.5,
                        minWidth: 'auto'
                      }}
                    >
                      Info
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteDrone(drone.droneId)}
                        sx={{
                          fontSize: '0.65rem',
                          px: 1,
                          py: 0.5,
                          minWidth: 'auto'
                        }}
                      >
                        Suppr
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {uniqueDrones.length === 0 && (
          <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Aucun drone trouvé
            </Typography>
          </Box>
        )}
      </Box>

      {isSuperAdmin && (
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={false}
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 },
              maxHeight: { xs: 'calc(100vh - 16px)', sm: 'calc(100vh - 64px)' },
              width: { xs: 'calc(100vw - 16px)', sm: 'auto' }
            }
          }}
        >
          <DialogTitle sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 }
          }}>
            Créer un drone
          </DialogTitle>
          <DialogContent sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 1, sm: 2 }
          }}>
            <Box
              sx={{
                pt: 1,
                display: "flex",
                flexDirection: "column",
                gap: { xs: 2, sm: 2.5 }
              }}
            >
              <TextField
                label="ID du drone"
                value={nextDroneId ?? ""}
                placeholder={nextDroneId?.toString()}
                disabled
                fullWidth
                size="medium"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
              <TextField
                label="Nom du drone"
                value={createForm.droneName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, droneName: e.target.value })
                }
                fullWidth
                size="medium"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
              <Autocomplete
                freeSolo
                options={cityOptions}
                value={selectedCity || null}
                inputValue={cityInput}
                onChange={(_, value) => {
                  const city = value || "";
                  setSelectedCity(city);
                  setCityInput(city);
                  setCreateForm({ ...createForm, centerId: "" });
                  setSelectedCenter(null);
                  if (city) {
                    fetchCentersByCity(city);
                  } else {
                    setCenterOptions([]);
                  }
                }}
                onInputChange={(_, value) => {
                  setCityInput(value);
                  if (value) {
                    fetchCityOptions(value);
                  }
                }}
                size="medium"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ville du centre"
                    fullWidth
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  />
                )}
              />
              <Autocomplete
                options={centerOptions}
                value={selectedCenter}
                getOptionLabel={(option) => option.centerAdress}
                onChange={(_, value) => {
                  setSelectedCenter(value);
                  setCreateForm({
                    ...createForm,
                    centerId: value ? String(value.centerId) : "",
                  });
                }}
                size="medium"
                renderOption={(props, option) => (
                  <li {...props} style={{ fontSize: window.innerWidth < 600 ? '0.875rem' : '1rem' }}>
                    {option.centerId}. {option.centerAdress}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Adresse du centre"
                    fullWidth
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 1.5 },
            flexDirection: { xs: 'column', sm: 'row' },
            '& .MuiButton-root': {
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              py: { xs: 1, sm: 0.75 }
            }
          }}>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              sx={{ order: { xs: 2, sm: 1 } }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateDrone}
              disabled={creating}
              variant="contained"
              sx={{ order: { xs: 1, sm: 2 } }}
            >
              {creating ? 'Création...' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog infos drone */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: 'calc(100vh - 16px)', sm: 'calc(100vh - 64px)' },
            width: { xs: 'calc(100vw - 16px)', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 }
        }}>
          Détails du Drone {selectedDrone ? selectedDrone.droneId : ""}
        </DialogTitle>
        <DialogContent sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 1, sm: 2 },
          overflow: { xs: 'auto', sm: 'visible' }
        }}>
          {selectedDrone && (
            <Box sx={{ pt: { xs: 1, sm: 2 } }}>
              <Box sx={{
                display: "flex",
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, sm: 2.5, md: 3 }
              }}>
                <Box sx={{
                  flex: { xs: 'none', md: "1 1 300px" },
                  minWidth: { xs: 'auto', md: 300 },
                  mb: { xs: 2, md: 0 }
                }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      fontWeight: 'bold'
                    }}
                  >
                    Informations générales
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gap: { xs: 0.75, sm: 1 },
                    '& > *': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      lineHeight: 1.4
                    }
                  }}>
                    <Typography>
                      <strong>Nom:</strong>{" "}
                      {selectedDrone.droneName || "Sans nom"}
                    </Typography>
                    <Typography>
                      <strong>Statut:</strong>{" "}
                      {selectedDrone.droneStatus || "N/A"}
                    </Typography>
                    <Typography>
                      <strong>Mode de vol:</strong>{" "}
                      {dronesFlightInfo[selectedDrone.droneId]?.flight_mode ||
                        "N/A"}
                    </Typography>
                    <Typography>
                      <strong>Armé:</strong>{" "}
                      {dronesFlightInfo[selectedDrone.droneId]?.is_armed
                        ? "Oui"
                        : "Non"}
                    </Typography>
                    {dronesFlightInfo[selectedDrone.droneId] && (
                      <>
                        <Typography>
                          <strong>Latitude:</strong>{" "}
                          {dronesFlightInfo[
                            selectedDrone.droneId
                          ]?.latitude?.toFixed(6) ?? "N/A"}
                        </Typography>
                        <Typography>
                          <strong>Longitude:</strong>{" "}
                          {dronesFlightInfo[
                            selectedDrone.droneId
                          ]?.longitude?.toFixed(6) ?? "N/A"}
                        </Typography>
                        <Typography>
                          <strong>Altitude:</strong>{" "}
                          {dronesFlightInfo[
                            selectedDrone.droneId
                          ]?.altitude_m?.toFixed(1) ?? "N/A"}
                          m
                        </Typography>
                        <Typography>
                          <strong>Vitesse:</strong>{" "}
                          {dronesFlightInfo[
                            selectedDrone.droneId
                          ]?.horizontal_speed_m_s?.toFixed(1) ?? "N/A"}
                          m/s
                        </Typography>
                        <Typography>
                          <strong>Direction:</strong>{" "}
                          {dronesFlightInfo[selectedDrone.droneId]
                            ?.heading_deg !== undefined
                            ? dronesFlightInfo[
                              selectedDrone.droneId
                            ]?.heading_deg?.toFixed(0)
                            : "N/A"}
                          °
                        </Typography>
                        <Typography>
                          <strong>Déplacement:</strong>{" "}
                          {dronesFlightInfo[selectedDrone.droneId]
                            ?.movement_track_deg !== undefined
                            ? dronesFlightInfo[
                              selectedDrone.droneId
                            ]?.movement_track_deg?.toFixed(0)
                            : "N/A"}
                          °
                        </Typography>
                        <Typography>
                          <strong>Batterie:</strong>{" "}
                          {selectedDrone && (() => {
                            const batteryInfo = dronesFlightInfo[selectedDrone.droneId];
                            const batteryPercent = batteryInfo?.battery_remaining_percent;
                            const isLowBattery = batteryPercent !== undefined && batteryPercent !== null && batteryPercent < 20;

                            return (
                              <span style={{
                                color: isLowBattery ? '#f44336' : 'inherit',
                                fontWeight: isLowBattery ? 'bold' : 'normal'
                              }}>
                                {batteryPercent !== undefined && batteryPercent !== null ? batteryPercent.toFixed(0) : "N/A"}%
                              </span>
                            );
                          })()}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
                <Box sx={{
                  flex: { xs: 'none', md: "1 1 300px" },
                  minWidth: { xs: 'auto', md: 300 }
                }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      fontWeight: 'bold'
                    }}
                  >
                    Historique des livraisons
                  </Typography>
                  {selectedDrone.deliveries &&
                    selectedDrone.deliveries.length > 0 ? (
                    <Box sx={{
                      maxHeight: { xs: 150, sm: 200, md: 250 },
                      overflow: "auto",
                      pr: { xs: 1, sm: 0 }
                    }}>
                      {selectedDrone.deliveries.map((delivery, index) => (
                        <Box
                          key={index}
                          sx={{
                            mb: { xs: 1.5, sm: 2 },
                            p: { xs: 1, sm: 1.5 },
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              fontWeight: 'bold',
                              mb: { xs: 0.5, sm: 0.75 }
                            }}
                          >
                            Livraison #{delivery.deliveryId}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
                              mb: 0.25
                            }}
                          >
                            Destination: {delivery.hospitalName},{" "}
                            {delivery.hospitalCity}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
                              mb: 0.25
                            }}
                          >
                            Statut: {delivery.deliveryStatus}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
                              mb: delivery.deliveryUrgent ? 0.5 : 0
                            }}
                          >
                            Date: {formatDate(delivery.dteDelivery, "dd/MM/yyyy")}
                          </Typography>
                          {delivery.deliveryUrgent && (
                            <Chip
                              label="URGENT"
                              size="small"
                              color="error"
                              sx={{
                                fontSize: '0.6rem',
                                height: 18
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontStyle: 'italic'
                      }}
                    >
                      Aucune livraison enregistrée
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 }
        }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              py: { xs: 1, sm: 0.75 },
              px: { xs: 2, sm: 2.5 }
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDroneManagement;
