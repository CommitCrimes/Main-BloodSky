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
import { dronesApi, type MissionCurrent } from '@/api/drone';
import type { DroneMission, DroneWaypoint, FlightInfo as ApiFlightInfo, Drone as ApiDrone } from '@/types/drone';
import { donationCenterApi } from '@/api/donation_center';
import { hospitalApi } from '@/api/hospital';
import AssignDeliveryDialog from '@/components/AssignDeliveryDialog'; // ajuste le chemin si besoin
import { deliveryApi } from '@/api/delivery';
import type { DeliveryStatus } from '@/types/delivery';
import type { DonationCenter } from '@/types';
import type { Hospital } from '@/types';

type CurrentMission = {
  count: number;
  items: Array<{ seq: number; lat: number; lon: number; alt?: number; command?: number }>;
};
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const fixed = (v: unknown, d = 0) => (isNum(v) ? (v as number).toFixed(d) : 'N/A');

const normalizeCurrent = (raw: MissionCurrent): CurrentMission => {
  const items = (raw.items ?? [])
    .map((wp, i) => ({
      seq: typeof wp.seq === 'number' ? wp.seq : i,
      lat: Number(wp.lat),
      lon: Number(wp.lon),
      alt: typeof wp.alt === 'number' ? wp.alt : undefined,
      command: typeof wp.command === 'number' ? wp.command : undefined,
    }))
    .filter(w => Number.isFinite(w.lat) && Number.isFinite(w.lon));

  return {
    count: typeof raw.count === 'number' ? raw.count : items.length,
    items,
  };
};


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
  const targetStorageKey = useMemo(() => `drone:${droneId}:target`, [droneId]);
  const [currentMission, setCurrentMission] = useState<CurrentMission | null>(null);
  const [homeBusy, setHomeBusy] = useState(false);
    const ALT_STORAGE_KEY = `drone:${droneId}:altitude`;
   const [cruiseAlt, setCruiseAlt] = useState<number>(() => {
    if (typeof window === 'undefined') return 50;
    const v = Number(localStorage.getItem(ALT_STORAGE_KEY));
    return Number.isFinite(v) && v > 0 ? v : 50;
  });

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
    altitude_takeoff: cruiseAlt,    
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
  const missionIsLoaded = (currentMission?.count ?? 0) > 0;
  const canStart = missionIsLoaded && !missionRunning;

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
  const setCurrentMissionSafe = (next: CurrentMission | null) => {
    setCurrentMission(prev => {
      if (!next) return prev ?? null;
      const hasItems = (next.items?.length ?? 0) > 0;
      if (!hasItems) return prev ?? next;
      return next;
    });
  };

  const fetchCurrentMission = async () => {
    try {
      const raw = await dronesApi.getMissionCurrent(droneId);
      setCurrentMissionSafe(normalizeCurrent(raw));
    } catch {
      setCurrentMissionSafe(null);
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
        await dronesApi.returnHome(droneId);
      } else {
        setHomeBusy(true);
        await createMissionToDonationCenter();
      }
      await fetchFlightInfo();
    } catch (err) {
      console.error('Error returning home / creating center mission:', err);
    }finally{
          setHomeBusy(false);
    }
  };


  const handleCreateMission = async () => {
    await withBusy(async () => {
      const payload: Mission = {
  ...missionData,
  ...(flightInfo
    ? {
        startlat: Number(flightInfo.latitude),
        startlon: Number(flightInfo.longitude),
        startalt:cruiseAlt || missionData.altitude_takeoff  ,
      }
    : {}),
};


      const res = await dronesApi.createMission(droneId, payload);
      await dronesApi.sendMissionFile(droneId, res.filename);
      const wps = payload.waypoints || [];
      if (wps.length > 0) {
        const last = wps[wps.length - 1];
        setTarget({
          id: wps.length - 1,
          lat: Number(last.lat),
          lon: Number(last.lon),
        });
      } else {
        setTarget(null);
      }

      setMissionDialogOpen(false);
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
    const newWaypoint: MissionWaypoint = { lat, lon, alt:cruiseAlt || missionData.altitude_takeoff };
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

    const ALT = cruiseAlt;
    const mission: Mission = {
      filename: `DEFAULT_Hopital_DroneID:${droneId}_HopitalID:${hospital.hospitalId}.waypoints`,
      altitude_takeoff: ALT,
      mode: 'auto',
      waypoints: [{ lat: deliveryLat, lon: deliveryLon, alt: ALT }],
...(flightInfo
  ? { startlat: Number(flightInfo.latitude), startlon: Number(flightInfo.longitude), startalt: ALT }
  : {}),
    };

    const res = await dronesApi.createMission(droneId, mission);
    await dronesApi.sendMissionFile(droneId, res.filename);

    setTarget({ id: hospital.hospitalId, lat: deliveryLat, lon: deliveryLon });

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

      const ALT = cruiseAlt;
      const mission: Mission = {
        filename: `DEFAULT_ReturnCenter_DroneID:${droneId}_CenterID:${donationCenter.centerId}.waypoints`,
        altitude_takeoff: ALT,
        mode: 'auto',
        waypoints: [{ lat, lon, alt: ALT }],
...(flightInfo
  ? { startlat: Number(flightInfo.latitude), startlon: Number(flightInfo.longitude), startalt: ALT }
  : {}),
      };

      const res = await dronesApi.createMission(droneId, mission);
      await dronesApi.sendMissionFile(droneId, res.filename);
      setTarget({ id: donationCenter.centerId, lat, lon });
      setMissionRunning(false);
      await fetchFlightInfo();
    });
  };

  const firstValid = <T extends { lat?: number; lon?: number }>(arr: T[]) =>
    arr.find(w => Number.isFinite(w?.lat) && Number.isFinite(w?.lon)) ?? null;

  // Lit la mission chargée et fixe le target selon le mode
const refreshTargetFromCurrentMission = async () => {
  try {
    const mode = (flightInfo?.flight_mode || '').toUpperCase();
    const isRTL = mode === 'RTL';
    const isArmed = flightInfo?.is_armed === true;

    // ↩️ Ne rien modifier si pas RTL ou pas armé (on garde la target actuelle)
    if (!isRTL || !isArmed) return;

    // (Optionnel) si tu veux aussi ignorer quand offline, décommente :
    // if (flightInfo?.unavailable || flightInfo?.state === 'offline') return;

    const cur = await dronesApi.getMissionCurrent(droneId);
    const items = cur?.items ?? [];
    if (!items.length) return; // rien à faire, on ne clear pas la target

    // En RTL + armé → prendre le premier WP valide (home/centre)
    const chosen = firstValid(items);
    if (!chosen) return;

    setTarget({
      id: typeof chosen.seq === 'number' ? chosen.seq : 0,
      lat: Number(chosen.lat),
      lon: Number(chosen.lon),
    });
  } catch (e) {
    console.warn('getMissionCurrent failed:', e);
  }
};

  useEffect(() => {
    void refreshTargetFromCurrentMission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [droneId, missionReady, missionRunning, flightInfo?.flight_mode]);

  useEffect(() => {
    let stop = false;
    const init = async () => {
      await Promise.all([
        fetchFlightInfo(),
        loadStaticData(droneId),
        fetchCurrentMission(),
      ]);
      if (stop) return;
    };
    init();
    const flightInterval = setInterval(fetchFlightInfo, 1000);
    const missionInterval = setInterval(fetchCurrentMission, 5000);
    return () => {
      stop = true;
      clearInterval(flightInterval);
      clearInterval(missionInterval);
    };
  }, [droneId]);

  useEffect(() => {
  try {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(targetStorageKey);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { id: number; lat: number; lon: number };
    if (typeof parsed?.id === 'number' && Number.isFinite(parsed?.lat) && Number.isFinite(parsed?.lon)) {
      setTarget(parsed);
    }
  } catch (e) {
    console.warn('Error reading target from localStorage:', e);
  }
}, [targetStorageKey]);

useEffect(() => {
  if (!flightInfo) return;
  if (!missionRunning) return;

  const mode = (flightInfo.flight_mode || '').toUpperCase();
  const disarmed = flightInfo.is_armed === false;
  const nearGround = Number(flightInfo.altitude_m ?? 0) < 2;
  const still =
    Math.abs(Number(flightInfo.horizontal_speed_m_s ?? 0)) < 0.3 &&
    Math.abs(Number(flightInfo.vertical_speed_m_s ?? 0)) < 0.3;
  const notAuto = mode !== 'AUTO';

  if (disarmed || (nearGround && still && notAuto)) {
    setMissionRunning(false);
  }
}, [flightInfo, missionRunning]);


  useEffect(() => {
    patchLeafletDefaultIcons();
  }, []);
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(targetStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { id: number; lat: number; lon: number };
      if (
        typeof parsed?.id === 'number' &&
        Number.isFinite(parsed?.lat) &&
        Number.isFinite(parsed?.lon)
      ) {
        setTarget(parsed);
      }
    } catch (e) {
      console.warn('Error reading target from localStorage:', e);
    }
  }, [targetStorageKey]);
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (target) localStorage.setItem(targetStorageKey, JSON.stringify(target));
      else localStorage.removeItem(targetStorageKey);
    } catch (e) {
      console.warn('Error writing target to localStorage:', e);
       }
  }, [targetStorageKey, target]);
  useEffect(() => {
  const mode = (flightInfo?.flight_mode || '').toUpperCase();
  const isRTL = mode === 'RTL';
  const isArmed = flightInfo?.is_armed === true;

  // 🔒 Ne JAMAIS toucher la target si pas RTL ou pas armé
  if (!isRTL || !isArmed) return;

  const items = currentMission?.items ?? [];
  if (!items.length) return;

  const chosen = firstValid(items); // en RTL : premier WP (home/centre)
  if (!chosen) return;

  setTarget({
    id: typeof chosen.seq === 'number' ? chosen.seq : 0,
    lat: Number(chosen.lat),
    lon: Number(chosen.lon),
  });
  setMissionReady(true);
}, [currentMission, flightInfo?.flight_mode, flightInfo?.is_armed]);

useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ALT_STORAGE_KEY, String(cruiseAlt));
  }
}, [ALT_STORAGE_KEY, cruiseAlt]);


  return (
    <Box sx={{ 
      height: { xs: 'auto', sm: '100vh' }, 
      minHeight: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      px: { xs: 1, sm: 2 },
      py: { xs: 1, sm: 0 }
    }}>
      {/* Header */}
      <Paper sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        mb: { xs: 1, sm: 2 }, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' }, 
        justifyContent: { xs: 'flex-start', md: 'space-between' },
        gap: { xs: 2, md: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onBack}
size="small"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 }
            }}
          >
            Retour
          </Button>
          <Typography 
            variant="h5" 
            sx={{ 
              fontFamily: 'Share Tech, monospace',
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              fontWeight: 'bold'
            }}
          >
            Drone {droneId} - Détails
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 },
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
           <TextField
    type="number"
    label="Altitude (m)"
    size="small"
    value={cruiseAlt}
    onChange={(e) => setCruiseAlt(Number(e.target.value || 0))} 
    onBlur={() => setCruiseAlt(Math.max(15, cruiseAlt))}       
    sx={{ width: 140 }}
    inputProps={{ min: 15, step: 1 }}
  />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchFlightInfo}
size="small"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 1 }
            }}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            onClick={() => setHospitalsDialogOpen(true)}
size="small"
            sx={{ 
              bgcolor: '#f44336', 
              '&:hover': { bgcolor: '#d32f2f' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 1 }
            }}
          >
            Hôpitaux
          </Button>
          <Button
            variant="contained"
            onClick={() => setAssignOpen(true)}
size="small"
            sx={{ 
              bgcolor: '#1976d2', 
              '&:hover': { bgcolor: '#125ea0' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 1 }
            }}
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
        <Paper sx={{ 
          p: { xs: 1, sm: 1.5 }, 
          mb: { xs: 1, sm: 1.5 } 
        }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              fontWeight: 'bold'
            }}
          >
            Informations de vol
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)' 
            },
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 1.5, sm: 2 }
          }}>
            <Card variant="outlined" sx={{ height: 'fit-content' }}>
              <CardContent sx={{ 
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                '&:last-child': { pb: { xs: 1.5, sm: 2 } }
              }}>
                <LocationOn sx={{ 
                  fontSize: { xs: 24, sm: 30 }, 
                  color: '#2196f3',
                  mb: { xs: 0.5, sm: 1 }
                }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    mb: 0.5
                  }}
                >
                  Position
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    fontWeight: 'medium',
                    wordBreak: 'break-all'
                  }}
                >
                  {fixed(flightInfo?.latitude, 6)}, {fixed(flightInfo?.longitude, 6)}
                </Typography>
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ height: 'fit-content' }}>
              <CardContent sx={{ 
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                '&:last-child': { pb: { xs: 1.5, sm: 2 } }
              }}>
                <Height sx={{ 
                  fontSize: { xs: 24, sm: 30 }, 
                  color: '#4caf50',
                  mb: { xs: 0.5, sm: 1 }
                }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    mb: 0.5
                  }}
                >
                  Altitude
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    fontWeight: 'bold'
                  }}
                >
                  {fixed(flightInfo?.altitude_m, 1)} m
                </Typography>
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ height: 'fit-content' }}>
              <CardContent sx={{ 
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                '&:last-child': { pb: { xs: 1.5, sm: 2 } }
              }}>
                <Speed sx={{ 
                  fontSize: { xs: 24, sm: 30 }, 
                  color: '#ff9800',
                  mb: { xs: 0.5, sm: 1 }
                }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    mb: 0.5
                  }}
                >
                  Vitesse
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    fontWeight: 'bold'
                  }}
                >
                  {fixed(flightInfo?.horizontal_speed_m_s, 1)} m/s
                </Typography>
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ height: 'fit-content' }}>
              <CardContent sx={{ 
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                '&:last-child': { pb: { xs: 1.5, sm: 2 } }
              }}>
                <Navigation sx={{ 
                  fontSize: { xs: 24, sm: 30 }, 
                  color: '#9c27b0',
                  mb: { xs: 0.5, sm: 1 }
                }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    mb: 0.5
                  }}
                >
                  Direction
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    fontWeight: 'bold'
                  }}
                >
                  {fixed(flightInfo?.heading_deg, 0)}°
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 0.5, sm: 1 }, 
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Chip
              label={flightInfo.is_armed ? 'ARMÉ' : 'DÉSARMÉ'}
              color={flightInfo.is_armed ? 'error' : 'default'}
  size="small"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                fontWeight: 'bold'
              }}
            />
            <Chip
              label={flightInfo.flight_mode}
              color="info"
  size="small"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                fontWeight: 'bold'
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Map */}
      <Paper sx={{ 
        flex: 1, 
        p: { xs: 0.5, sm: 1 }, 
        position: 'relative',
        minHeight: { xs: '60vh', sm: '50vh', md: '60vh' },
        height: { xs: 'auto', sm: 'auto' }
      }}>
        {flightInfo && (
          <MapContainer
  center={[Number(flightInfo?.latitude ?? 0), Number(flightInfo?.longitude ?? 0)]}
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
  position={[Number(flightInfo?.latitude ?? 0), Number(flightInfo?.longitude ?? 0)]}
              icon={droneIcon} zIndexOffset={1000}
            >
              <Popup>
                <div>
                  <strong>Drone {droneId}</strong><br />
Mode: {flightInfo?.flight_mode}<br />
Altitude: {fixed(flightInfo?.altitude_m, 1)} m<br />
Vitesse: {fixed(flightInfo?.horizontal_speed_m_s, 1)} m/s<br />
Cap (heading): {fixed(flightInfo?.heading_deg, 0)}°<br />
Déplacement: {fixed(flightInfo?.movement_track_deg, 0)}°<br />
Batterie: {fixed(flightInfo?.battery_remaining_percent, 0)}%<br />
{Number(flightInfo?.horizontal_speed_m_s ?? 0) > 0.1
  ? <span style={{ color: '#00ff00' }}>🡹 En mouvement</span>
  : <span style={{ color: '#999' }}>⏸ Stationnaire</span>}
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
        <Box sx={{ 
          position: 'absolute', 
          bottom: { xs: 8, sm: 16 }, 
          right: { xs: 8, sm: 16 }, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 0.5, sm: 1 },
          zIndex: 1000
        }}>
          <Fab
            color="primary"
            onClick={() => setMissionDialogOpen(true)}
size="small"
            sx={{ 
              width: { xs: 40, sm: 56 },
              height: { xs: 40, sm: 56 },
              boxShadow: 2
            }}
          >
            <Add sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Fab>
          <Fab
            color="secondary"
            onClick={handleStartMission}
size="small"
            disabled={!canStart}
            sx={{ 
              width: { xs: 40, sm: 56 },
              height: { xs: 40, sm: 56 },
              boxShadow: 2
            }}
          >
            <PlayArrow sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Fab>
          <Fab
            color="default"
            onClick={handleReturnHome}
size="small"
            disabled={homeBusy}
            sx={{ 
              width: { xs: 40, sm: 56 },
              height: { xs: 40, sm: 56 },
              boxShadow: 2
            }}
          >
            {homeBusy ? 
              <CircularProgress size={20} /> : 
              <Home sx={{ fontSize: { xs: 20, sm: 24 } }} />
            }
          </Fab>
          <Fab
            color="inherit"
            onClick={() => setModifyDialogOpen(true)}
size="small"
            sx={{ 
              width: { xs: 40, sm: 56 },
              height: { xs: 40, sm: 56 },
              boxShadow: 2
            }}
          >
            <Edit sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Fab>
        </Box>
      </Paper>

      {/* Mission Creation Dialog */}
      <Dialog 
        open={missionDialogOpen} 
        onClose={() => setMissionDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
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
          Créer une mission
        </DialogTitle>
        <DialogContent sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 1, sm: 2 },
          overflow: 'auto'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 2, sm: 2.5 }, 
            pt: { xs: 1, sm: 2 } 
          }}>
            <TextField
              label="Nom du fichier"
              value={missionData.filename}
              onChange={(e) => setMissionData({ ...missionData, filename: e.target.value })}
              fullWidth
  size="small"
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
              label="Altitude de décollage (m)"
              type="number"
              value={missionData.altitude_takeoff}
              onChange={(e) => setMissionData({ ...missionData, altitude_takeoff: Number(e.target.value) })}
              fullWidth
  size="small"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Mode</InputLabel>
              <Select
                value={missionData.mode}
                onChange={(e) => setMissionData({ ...missionData, mode: e.target.value as 'auto' | 'man' })}
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              >
                <MenuItem value="auto" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Auto (avec décollage/atterrissage)
                </MenuItem>
                <MenuItem value="man" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Manuel (waypoints seulement)
                </MenuItem>
              </Select>
            </FormControl>

            <Typography 
              variant="subtitle2"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 'bold'
              }}
            >
              Waypoints ({waypoints.length})
            </Typography>
            <Box sx={{ 
              maxHeight: { xs: '200px', sm: '300px' }, 
              overflow: 'auto',
              border: waypoints.length > 3 ? '1px solid #e0e0e0' : 'none',
              borderRadius: waypoints.length > 3 ? 1 : 0,
              p: waypoints.length > 3 ? 1 : 0
            }}>
              {waypoints.map((wp, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 1 }, 
                    alignItems: { xs: 'stretch', sm: 'center' },
                    mb: { xs: 2, sm: 1.5 },
                    p: { xs: 1, sm: 0 },
                    border: { xs: '1px solid #e0e0e0', sm: 'none' },
                    borderRadius: { xs: 1, sm: 0 }
                  }}
                >
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
                    sx={{ 
                      flex: { xs: 'none', sm: 1 },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }
                    }}
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
                    sx={{ 
                      flex: { xs: 'none', sm: 1 },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }
                    }}
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
                    sx={{ 
                      flex: { xs: 'none', sm: 1 },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }
                    }}
                  />
                  <Button 
                    onClick={() => removeWaypoint(index)} 
                    color="error"
                    size="small"
variant="outlined"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8rem' },
                      px: { xs: 2, sm: 1 },
                      py: { xs: 0.75, sm: 0.5 },
                      minWidth: { xs: 'auto', sm: 'auto' },
                      alignSelf: { xs: 'stretch', sm: 'center' }
                    }}
                  >
                    Supprimer
                  </Button>
                </Box>
              ))}
            </Box>

            <Button
              onClick={() => {
                if (flightInfo) {
                  addWaypoint(Number(flightInfo.latitude) + 0.001, Number(flightInfo.longitude) + 0.001);
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
            onClick={() => setMissionDialogOpen(false)}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleCreateMission} 
            variant="contained"
            sx={{ order: { xs: 1, sm: 2 } }}
          >
            Créer la mission
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mission Modification Dialog */}
      <Dialog 
        open={modifyDialogOpen} 
        onClose={() => setModifyDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
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
          Modifier une mission
        </DialogTitle>
        <DialogContent sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 1, sm: 2 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 2, sm: 2.5 }, 
            pt: { xs: 1, sm: 2 } 
          }}>
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
      <Dialog 
        open={hospitalsDialogOpen} 
        onClose={() => setHospitalsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
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
          Sélectionner un hôpital pour créer une mission
        </DialogTitle>
        <DialogContent sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 1, sm: 2 },
          overflow: 'auto'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 1.5, sm: 2 }, 
            pt: { xs: 1, sm: 2 } 
          }}>
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
                      p: { xs: 1.5, sm: 2 },
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
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: { xs: 'flex-start', sm: 'space-between' }, 
                      alignItems: { xs: 'stretch', sm: 'center' },
                      gap: { xs: 1.5, sm: 0 }
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#f44336',
                            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                          }}
                        >
                          {hospital.hospitalName}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            mb: { xs: 0.5, sm: 0 }
                          }}
                        >
                          {hospital.hospitalAdress}, {hospital.hospitalCity} - {hospital.hospitalPostal}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            display: 'block',
                            wordBreak: 'break-all'
                          }}
                        >
                          Lat: {parseFloat(hospital.hospitalLatitude).toFixed(6)}, Lon: {parseFloat(hospital.hospitalLongitude).toFixed(6)}
                        </Typography>
                      </Box>

                      <Box sx={{ 
                        textAlign: { xs: 'center', sm: 'right' }, 
                        display: 'flex', 
                        flexDirection: { xs: 'row', sm: 'row' },
                        alignItems: 'center', 
                        justifyContent: { xs: 'center', sm: 'flex-end' },
                        gap: 1,
                        mt: { xs: 1, sm: 0 }
                      }}>
                        <Typography 
                          variant="body2" 
                          color="primary"
                          sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            textAlign: 'center'
                          }}
                        >
                          Cliquer pour créer mission
                        </Typography>
                        {busy && <CircularProgress size={16} />}
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
        defaultAltitude={cruiseAlt}
        onMissionReady={async ({ deliveryId, hospitalId, lat, lon }) => {
          setAssignOpen(false);
          setMissionReady(true);
          setMissionRunning(false);
          setCurrentDeliveryId(deliveryId);
          setTarget({ id: hospitalId, lat, lon });

          await fetchFlightInfo();
          await fetchCurrentMission();
        }}
      />

    </Box>
  );
};

export default DroneDetailView;