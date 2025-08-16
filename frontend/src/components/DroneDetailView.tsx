import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Fab
} from '@mui/material';
import { ArrowBack, PlayArrow, Home, Edit, Add, Refresh, LocationOn, Speed, Height, Navigation, } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, CircleMarker, Pane } from 'react-leaflet';
import {
  patchLeafletDefaultIcons,
  createDroneIcon,
  bloodHouseIcon,
  hospitalIcon
} from '@/components/map/leafletIcons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dronesApi } from '@/api/drone';
import type { DroneMission, DroneWaypoint, FlightInfo as ApiFlightInfo, Drone as ApiDrone } from '@/types/drone';
import { donationCenterApi } from '@/api/donation_center';
import { hospitalApi } from '@/api/hospital';
import AssignDeliveryDialog from '@/components/AssignDeliveryDialog'; // ajuste le chemin si besoin
import { deliveryApi } from '@/api/delivery';
import type { DeliveryStatus } from '@/types/delivery';
import type { DonationCenter } from '@/types';
import type { Hospital } from '@/types';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DroneDetailViewProps {
  droneId: number;
  onBack: () => void;
}
type DroneFlightInfo = ApiFlightInfo;
type MissionWaypoint = DroneWaypoint;
type Mission = DroneMission;

const DroneDetailView: React.FC<DroneDetailViewProps> = ({ droneId, onBack }) => {
  const [flightInfo, setFlightInfo] = useState<DroneFlightInfo | null>(null);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [waypoints, setWaypoints] = useState<MissionWaypoint[]>([]);
  const [missionReady, setMissionReady] = useState(false);
  const [missionRunning, setMissionRunning] = useState(false);
  const [, setMissionUploading] = useState(false);
  const heading = flightInfo?.heading_deg ?? 0;
  const droneIcon = useMemo(() => createDroneIcon(heading), [heading]);

  const withBusy = async <T,>(fn: () => Promise<T>) => {
    setMissionUploading(true);
    try {
      return await fn();
    } finally {
      setMissionUploading(false);
    }
  };

  const [missionData, setMissionData] = useState<Mission>({
    filename: `mission_drone_${droneId}_${Date.now()}.waypoints`,
    altitude_takeoff: 30,
    mode: 'auto',
    waypoints: []
  });
  const [modifyData, setModifyData] = useState({
    filename: '',
    seq: 0,
    lat: 0,
    lon: 0,
    alt: 0
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsDialogOpen, setHospitalsDialogOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [sendingHospitalId, setSendingHospitalId] = useState<number | null>(null);
  const [currentDeliveryId, setCurrentDeliveryId] = useState<number | null>(null);

  const [, setDrone] = useState<ApiDrone | null>(null);
  const [donationCenter, setDonationCenter] = useState<DonationCenter | null>(null);
  const [target, setTarget] = useState<{ id: number; lat: number; lon: number } | null>(null);

  const toNum = (s: string | number | null | undefined): number => {
    if (typeof s === 'number') return s;
    const n = Number((s ?? '').toString().trim().replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  };

  const fetchFlightInfo = async () => {
    try {
      const data = await dronesApi.getFlightInfo(droneId);
      setFlightInfo(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching flight info:', err);
      setError('Impossible de récupérer les informations de vol');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMission = async () => {
    try {
      await dronesApi.startMission(droneId);
      setMissionRunning(true);
      setMissionReady(false);

      if (currentDeliveryId != null) {
        try {
          await deliveryApi.update(currentDeliveryId, { deliveryStatus: 'in_transit' as DeliveryStatus });
        } catch (e) {
          console.warn('Maj statut in_transit échouée:', e);
        }
      }

      //alert('Mission démarrée avec succès !');
      await fetchFlightInfo();
    } catch (err) {
      console.error('Error starting mission:', err);
      //alert(`Erreur lors du démarrage de la mission: ${err}`);
    }
  };


  const handleReturnHome = async () => {
    try {
      if (flightInfo?.is_armed) {
        // En vol → RTL
        await dronesApi.returnHome(droneId);
        setTarget(null);
        //alert('RTL envoyé, retour automatique.');
      } else {
        // Au sol → mission “donation center” (décollage + vol + atterrissage)
        await createMissionToDonationCenter();
        //alert('Mission vers le centre créée et chargée !');
      }
      await fetchFlightInfo();
    } catch (err) {
      console.error('Error returning home / creating center mission:', err);
      //alert(`Erreur: ${err}`);
    }
  };


  const handleCreateMission = async () => {
    await withBusy(async () => {
      const payload: Mission = {
        ...missionData,
        ...(flightInfo
          ? {
            startlat: flightInfo.latitude,
            startlon: flightInfo.longitude,
            startalt: missionData.altitude_takeoff,
          }
          : {}),
      };

      const res = await dronesApi.createMission(droneId, payload);
      await dronesApi.sendMissionFile(droneId, res.filename);

      setMissionDialogOpen(false);
      setMissionReady(true);
      setMissionRunning(false);
      await fetchFlightInfo();
    });
  };

  const handleModifyMission = async () => {
    try {
      await dronesApi.modifyMission(droneId, {
        filename: modifyData.filename,
        seq: modifyData.seq,
        updates: {
          lat: modifyData.lat,
          lon: modifyData.lon,
          alt: modifyData.alt,
        },
      });
      //alert('Mission modifiée avec succès !');
      setModifyDialogOpen(false);
      await fetchFlightInfo();
    } catch (err) {
      console.error('Error modifying mission:', err);
      //alert(`Erreur lors de la modification de la mission: ${err}`);
    }
  };


  const addWaypoint = (lat: number, lon: number) => {
    const newWaypoint: MissionWaypoint = {
      lat,
      lon,
      alt: missionData.altitude_takeoff
    };
    setWaypoints([...waypoints, newWaypoint]);
    setMissionData({
      ...missionData,
      waypoints: [...waypoints, newWaypoint]
    });
  };

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (missionDialogOpen) {
          addWaypoint(e.latlng.lat, e.latlng.lng);
        }
      }
    });
    return null;
  };

  const removeWaypoint = (index: number) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(newWaypoints);
    setMissionData({
      ...missionData,
      waypoints: newWaypoints
    });
  };

  const fetchHospitalsByCity = async (city: string) => {
    try {
      const hs = await hospitalApi.getByCity(city);
      const normalized: Hospital[] = hs.map(h => ({
        hospitalId: h.hospitalId,
        hospitalName: h.hospitalName,
        hospitalAdress: h.hospitalAdress ?? '',
        hospitalCity: h.hospitalCity ?? '',
        hospitalPostal: h.hospitalPostal != null ? String(h.hospitalPostal) : '',
        hospitalLatitude: h.hospitalLatitude ?? '',
        hospitalLongitude: h.hospitalLongitude ?? '',
      }));
      setHospitals(normalized);
    } catch (err) {
      console.error('getByCity error:', err);
      setHospitals([]);
    }
  };

  const loadStaticData = async (id: number) => {
    try {
      const d = await dronesApi.getById(id);
      setDrone(d);

      if (!d?.centerId) {
        setDonationCenter(null);
        setHospitals([]);
        return;
      }

      const center = await donationCenterApi.getCenterById(d.centerId);
      const dc = center as unknown as DonationCenter;
      setDonationCenter(dc);

      const city = (dc.centerCity ?? '').trim();
      if (city) {
        await fetchHospitalsByCity(city);
      } else {
        setHospitals([]);
      }
    } catch (err) {
      console.error('loadStaticData error:', err);
      setDonationCenter(null);
      setHospitals([]);
    }
  };




  // Création d’une mission vers un hôpital via /mission/create
  const createMissionToHospital = async (hospital: {
    hospitalId: number;
    hospitalName: string;
    hospitalLatitude: string;
    hospitalLongitude: string;
  }) => {
    const toNum = (s: string) => Number(String(s).trim().replace(',', '.'));
    const deliveryLat = toNum(hospital.hospitalLatitude);
    const deliveryLon = toNum(hospital.hospitalLongitude);
    if (!Number.isFinite(deliveryLat) || !Number.isFinite(deliveryLon)) {
      console.warn(`Coordonnées invalides pour ${hospital.hospitalName}`);
      return;
    }

    setWaypoints([]);
    setMissionData((prev: Mission) => ({ ...prev, waypoints: [] }));

    const ALT = 50;
    const mission: Mission = {
      filename: `DEFAULT_Hopital_DroneID:${droneId}_HopitalID:${hospital.hospitalId}.waypoints`,
      altitude_takeoff: ALT,
      mode: 'auto',
      waypoints: [{ lat: deliveryLat, lon: deliveryLon, alt: ALT }],
      ...(flightInfo
        ? { startlat: flightInfo.latitude, startlon: flightInfo.longitude, startalt: ALT }
        : {}),
    };

    const res = await dronesApi.createMission(droneId, mission);
    await dronesApi.sendMissionFile(droneId, res.filename);

    setTarget({ id: hospital.hospitalId, lat: deliveryLat, lon: deliveryLon });
    setMissionReady(true);
    setMissionRunning(false);
    setHospitalsDialogOpen(false);
    await fetchFlightInfo();
  };

  const createMissionToDonationCenter = async () => {
  if (!donationCenter) {
    console.warn('Centre de don inconnu.');
    return;
  }
  await withBusy(async () => {
    const lat = toNum(donationCenter.centerLatitude);
    const lon = toNum(donationCenter.centerLongitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      console.warn('Coordonnées du centre de don invalides.');
      return;
    }

    const ALT = 50;
    const mission: Mission = {
      filename: `DEFAULT_ReturnCenter_DroneID:${droneId}_CenterID:${donationCenter.centerId}.waypoints`,
      altitude_takeoff: ALT,
      mode: 'auto',
      waypoints: [{ lat, lon, alt: ALT }],
      ...(flightInfo
        ? { startlat: flightInfo.latitude, startlon: flightInfo.longitude, startalt: ALT }
        : {}),
    };

    const res = await dronesApi.createMission(droneId, mission);
    await dronesApi.sendMissionFile(droneId, res.filename);

    setTarget({ id: donationCenter.centerId, lat, lon });
    setMissionReady(true);
    setMissionRunning(false);
  });
};






  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await Promise.all([fetchFlightInfo(), loadStaticData(droneId)]);
      if (cancelled) return;
    };

    init();

    const interval = setInterval(() => {
      fetchFlightInfo();
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [droneId]);

  useEffect(() => {
    if (!flightInfo) return;
    if (!missionRunning) return;

    const mode = (flightInfo.flight_mode || '').toUpperCase();
    const disarmed = !flightInfo.is_armed;
    const nearGround = flightInfo.altitude_m < 2;
    const still = Math.abs(flightInfo.horizontal_speed_m_s) < 0.3 && Math.abs(flightInfo.vertical_speed_m_s) < 0.3;
    const notAuto = mode !== 'AUTO';

    if (disarmed || (nearGround && still && notAuto)) {
      setMissionRunning(false);
      // missionReady reste false : le bouton se désactive tant qu'on n’a pas renvoyé un nouveau fichier
    }
  }, [flightInfo, missionRunning]);

  useEffect(() => {
    patchLeafletDefaultIcons();
  }, []);




  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onBack}
          >
            Retour
          </Button>
          <Typography variant="h5" sx={{ fontFamily: 'Share Tech, monospace' }}>
            Drone {droneId} - Détails
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchFlightInfo}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            onClick={() => setHospitalsDialogOpen(true)}
            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
          >
            Hôpitaux
          </Button>
          <Button
            variant="contained"
            onClick={() => setAssignOpen(true)}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#125ea0' } }}
          >
            Assigner livraison
          </Button>

        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Flight Info Cards */}
      {flightInfo && (
        <Paper sx={{ p: 1, mb: 1 }}>
          <Typography variant="h6" gutterBottom>
            Informations de vol
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocationOn sx={{ fontSize: 30, color: '#2196f3' }} />
                  <Typography variant="body2" color="text.secondary">
                    Position
                  </Typography>
                  <Typography variant="body1">
                    {flightInfo.latitude.toFixed(6)}, {flightInfo.longitude.toFixed(6)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Height sx={{ fontSize: 30, color: '#4caf50' }} />
                  <Typography variant="body2" color="text.secondary">
                    Altitude
                  </Typography>
                  <Typography variant="body1">
                    {flightInfo.altitude_m.toFixed(1)} m
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Speed sx={{ fontSize: 30, color: '#ff9800' }} />
                  <Typography variant="body2" color="text.secondary">
                    Vitesse
                  </Typography>
                  <Typography variant="body1">
                    {flightInfo.horizontal_speed_m_s.toFixed(1)} m/s
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Navigation sx={{ fontSize: 30, color: '#9c27b0' }} />
                  <Typography variant="body2" color="text.secondary">
                    Direction
                  </Typography>
                  <Typography variant="body1">
                    {flightInfo.heading_deg.toFixed(0)}°
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Chip
              label={flightInfo.is_armed ? 'ARMÉ' : 'DÉSARMÉ'}
              color={flightInfo.is_armed ? 'error' : 'default'}
            />
            <Chip
              label={flightInfo.flight_mode}
              color="info"
            />
          </Box>
        </Paper>
      )}

      {/* Map */}
      <Paper sx={{ flex: 1, p: 1, position: 'relative' }}>
        {flightInfo && (
          <MapContainer
            center={[flightInfo.latitude, flightInfo.longitude]}
            zoom={15}
            style={{ height: '100%', width: '100%', borderRadius: 20 }}
          >
            {/* Pane au-dessus des markers */}
            <Pane name="highlight" style={{ zIndex: 700 }} />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri'
            />
            <MapClickHandler />
            {/* Halo de la cible */}
            {target && (
              <CircleMarker
                center={[target.lat, target.lon]}
                radius={25}
                pathOptions={{ color: 'lime', weight: 3, fillOpacity: 0.15 }}
                pane="highlight"
              />
            )}
            {donationCenter &&
              donationCenter.centerLatitude !== null &&
              donationCenter.centerLongitude !== null &&
              !isNaN(Number(donationCenter.centerLatitude)) &&
              !isNaN(Number(donationCenter.centerLongitude)) && (
                <Marker position={[Number(donationCenter.centerLatitude), Number(donationCenter.centerLongitude)]}
                  icon={bloodHouseIcon} zIndexOffset={1}>
                  <Popup>
                    <strong>Centre de don</strong><br />
                    {donationCenter.centerAdress}<br />
                    {donationCenter.centerPostal} {donationCenter.centerCity}
                  </Popup>
                </Marker>
              )}

           // Dans la carte
            {hospitals.map((h) => {
              const lat = toNum(h.hospitalLatitude);
              const lon = toNum(h.hospitalLongitude);
              if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

              return (
                <Marker key={h.hospitalId} position={[lat, lon]} icon={hospitalIcon} zIndexOffset={1} >
                  <Popup>
                    <strong>{h.hospitalName ?? 'Hôpital'}</strong><br />
                    {h.hospitalAdress ?? ''}<br />
                    {(h.hospitalCity ?? '')} — {(h.hospitalPostal ?? '')}
                  </Popup>
                </Marker>
              );
            })}


            <Marker
              position={[flightInfo.latitude, flightInfo.longitude]}
              icon={droneIcon} zIndexOffset={1000}
            >
              <Popup>
                <div>
                  <strong>Drone {droneId}</strong><br />
                  Mode: {flightInfo.flight_mode}<br />
                  Altitude: {flightInfo.altitude_m.toFixed(1)} m<br />
                  Vitesse: {flightInfo.horizontal_speed_m_s.toFixed(1)} m/s<br />
                  Cap (heading): {flightInfo.heading_deg.toFixed(0)}°<br />
                  Déplacement: {flightInfo.movement_track_deg?.toFixed(0) || 'N/A'}°<br />
                  Batterie: {flightInfo.battery_remaining_percent?.toFixed(0) || 'N/A'}%<br />
                  {flightInfo.horizontal_speed_m_s > 0.1 ? (
                    <span style={{ color: '#00ff00' }}>🡹 En mouvement</span>
                  ) : (
                    <span style={{ color: '#999' }}>⏸ Stationnaire</span>
                  )}
                </div>
              </Popup>
            </Marker>

            {waypoints.length > 0 && (
              <>
                {waypoints.map((wp, index) => (
                  <Marker
                    key={index}
                    position={[wp.lat, wp.lon]}
                    eventHandlers={{
                      click: () => removeWaypoint(index)
                    }}
                  >
                    <Popup>
                      <div>
                        <strong>Waypoint {index + 1}</strong><br />
                        Altitude: {wp.alt} m<br />
                        <Button size="small" onClick={() => removeWaypoint(index)}>
                          Supprimer
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <Polyline
                  positions={waypoints.map(wp => [wp.lat, wp.lon])}
                  color="blue"
                  weight={3}
                />
              </>
            )}
          </MapContainer>
        )}

        {/* Control Buttons */}
        <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Fab
            color="primary"
            onClick={() => setMissionDialogOpen(true)}
            size="small"
          >
            <Add />
          </Fab>
          <Fab
            color="secondary"
            onClick={handleStartMission}
            size="small"
            disabled={!missionReady || missionRunning}
          >
            <PlayArrow />
          </Fab>
          <Fab
            color="default"
            onClick={handleReturnHome}
            size="small"
          >
            <Home />
          </Fab>
          <Fab
            color="inherit"
            onClick={() => setModifyDialogOpen(true)}
            size="small"
          >
            <Edit />
          </Fab>
        </Box>
      </Paper>

      {/* Mission Creation Dialog */}
      <Dialog open={missionDialogOpen} onClose={() => setMissionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Créer une mission</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nom du fichier"
              value={missionData.filename}
              onChange={(e) => setMissionData({ ...missionData, filename: e.target.value })}
              fullWidth
            />
            <TextField
              label="Altitude de décollage (m)"
              type="number"
              value={missionData.altitude_takeoff}
              onChange={(e) => setMissionData({ ...missionData, altitude_takeoff: Number(e.target.value) })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Mode</InputLabel>
              <Select
                value={missionData.mode}
                onChange={(e) => setMissionData({ ...missionData, mode: e.target.value as 'auto' | 'man' })}
              >
                <MenuItem value="auto">Auto (avec décollage/atterrissage)</MenuItem>
                <MenuItem value="man">Manuel (waypoints seulement)</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle2">
              Waypoints ({waypoints.length})
            </Typography>
            {waypoints.map((wp, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Latitude"
                  type="number"
                  value={wp.lat}
                  onChange={(e) => {
                    const newWaypoints = [...waypoints];
                    newWaypoints[index] = { ...wp, lat: Number(e.target.value) };
                    setWaypoints(newWaypoints);
                    setMissionData({ ...missionData, waypoints: newWaypoints });
                  }}
                  size="small"
                />
                <TextField
                  label="Longitude"
                  type="number"
                  value={wp.lon}
                  onChange={(e) => {
                    const newWaypoints = [...waypoints];
                    newWaypoints[index] = { ...wp, lon: Number(e.target.value) };
                    setWaypoints(newWaypoints);
                    setMissionData({ ...missionData, waypoints: newWaypoints });
                  }}
                  size="small"
                />
                <TextField
                  label="Altitude"
                  type="number"
                  value={wp.alt}
                  onChange={(e) => {
                    const newWaypoints = [...waypoints];
                    newWaypoints[index] = { ...wp, alt: Number(e.target.value) };
                    setWaypoints(newWaypoints);
                    setMissionData({ ...missionData, waypoints: newWaypoints });
                  }}
                  size="small"
                />
                <Button onClick={() => removeWaypoint(index)} color="error">
                  Supprimer
                </Button>
              </Box>
            ))}

            <Button
              onClick={() => {
                if (flightInfo) {
                  addWaypoint(flightInfo.latitude + 0.001, flightInfo.longitude + 0.001);
                }
              }}
              variant="outlined"
              startIcon={<Add />}
            >
              Ajouter un waypoint
            </Button>

            <Typography variant="caption" color="text.secondary">
              Conseil: Cliquez sur la carte pour ajouter des waypoints visuellement
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMissionDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateMission} variant="contained">
            Créer la mission
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mission Modification Dialog */}
      <Dialog open={modifyDialogOpen} onClose={() => setModifyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier une mission</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nom du fichier de mission"
              placeholder="missions/mission_auto.waypoints"
              value={modifyData.filename}
              onChange={(e) => setModifyData({ ...modifyData, filename: e.target.value })}
              fullWidth
            />
            <TextField
              label="Numéro de séquence à modifier"
              type="number"
              value={modifyData.seq}
              onChange={(e) => setModifyData({ ...modifyData, seq: Number(e.target.value) })}
              fullWidth
            />
            <Typography variant="subtitle2">
              Modifications à apporter:
            </Typography>
            <TextField
              label="Nouvelle latitude"
              type="number"
              value={modifyData.lat}
              onChange={(e) => setModifyData({ ...modifyData, lat: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Nouvelle longitude"
              type="number"
              value={modifyData.lon}
              onChange={(e) => setModifyData({ ...modifyData, lon: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Nouvelle altitude"
              type="number"
              value={modifyData.alt}
              onChange={(e) => setModifyData({ ...modifyData, alt: Number(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModifyDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleModifyMission} variant="contained">
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hospitals Dialog */}
      <Dialog open={hospitalsDialogOpen} onClose={() => setHospitalsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Sélectionner un hôpital pour créer une mission
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {hospitals.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Chargement des hôpitaux...
                </Typography>
              </Box>
            ) : (
              hospitals.map((hospital) => {
                const busy = sendingHospitalId === hospital.hospitalId;

                return (
                  <Paper
                    key={hospital.hospitalId}
                    sx={{
                      p: 2,
                      cursor: busy ? 'default' : 'pointer',
                      opacity: busy ? 0.6 : 1,
                      pointerEvents: busy ? 'none' : 'auto',
                      position: 'relative',
                      '&:hover': { bgcolor: busy ? undefined : 'grey.100', boxShadow: busy ? 0 : 2 },
                    }}
                    onClick={async () => {
                      setSendingHospitalId(hospital.hospitalId);
                      try {
                        await createMissionToHospital(hospital);
                      } finally {
                        setSendingHospitalId(null);
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                          {hospital.hospitalName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hospital.hospitalAdress}, {hospital.hospitalCity} - {hospital.hospitalPostal}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lat: {parseFloat(hospital.hospitalLatitude).toFixed(6)}, Lon: {parseFloat(hospital.hospitalLongitude).toFixed(6)}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="primary">
                          Cliquer pour créer mission
                        </Typography>
                        {busy && <CircularProgress size={16} />} {/* spinner uniquement pour CET hôpital */}
                      </Box>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHospitalsDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      <AssignDeliveryDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        centerId={donationCenter?.centerId ?? null}
        droneId={droneId}
        statusFilter="pending"
        onMissionReady={async ({ deliveryId, hospitalId, lat, lon }) => {
          setAssignOpen(false);
          setMissionReady(true);
          setMissionRunning(false);
          setCurrentDeliveryId(deliveryId);

          // NEW: cible pour le halo
          setTarget({ id: hospitalId, lat, lon });

          await fetchFlightInfo();
        }}
      />

    </Box>
  );
};

export default DroneDetailView;