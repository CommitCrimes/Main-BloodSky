import React, { useState, useEffect } from 'react';
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
import {
  ArrowBack,
  PlayArrow,
  Home,
  Edit,
  Add,
  Refresh,
  LocationOn,
  Speed,
  Height,
  Navigation,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import droneTopViewImage from '../assets/drone_TopView.png';
import BloodHouseIcon from '../assets/drop_of_blood.png';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createDroneIcon = (heading: number, movementTrack: number, isMoving: boolean) => {
  //let headingDiff = movementTrack - heading;
  //if (headingDiff < -180) headingDiff -= 360;
  //if (headingDiff > 180) headingDiff += 360;
  
  //const isMovingForward = Math.abs(headingDiff) > 90;
  //const arrowColor = isMovingForward ? '#f4f5f4ff' : '#f3e9daff';
  //const arrowPosition = isMovingForward ? 'top: -15px;' : 'bottom: -15px;';
  
  return L.divIcon({
    html: `
      <div style="
        width: 80px;
        height: 80px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img src="${droneTopViewImage}" style="
          width: 65px;
          height: 65px;
          transform: rotate(${heading}deg);
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
        " />
        <div style="
          position: absolute;
          
          left: 50%;
          transform: translateX(-50%) rotate(${movementTrack - heading}deg);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 20px solid;
          filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.66));
        "></div>
      </div>
    `,
    className: 'drone-marker',
    iconSize: [80, 80],
    iconAnchor: [40, 40],
  });
};

const createBloodHouseIcon = () =>
  L.icon({
    iconUrl: BloodHouseIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });


interface DroneDetailViewProps {
  droneId: number;
  onBack: () => void;
}

interface DroneFlightInfo {
  drone_id: string;
  is_armed: boolean;
  flight_mode: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  horizontal_speed_m_s: number;
  vertical_speed_m_s: number;
  heading_deg: number;
  movement_track_deg: number;
  battery_remaining_percent: number;
}

interface MissionWaypoint {
  seq?: number;
  current?: number;
  frame?: number;
  command?: number;
  param1?: number;
  param2?: number;
  param3?: number;
  param4?: number;
  lat: number;
  lon: number;
  alt: number;
  autoContinue?: number;
}

interface Mission {
  filename: string;
  altitude_takeoff: number;
  mode: 'auto' | 'man';
  waypoints: MissionWaypoint[];
}

const DroneDetailView: React.FC<DroneDetailViewProps> = ({ droneId, onBack }) => {
  const [flightInfo, setFlightInfo] = useState<DroneFlightInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [waypoints, setWaypoints] = useState<MissionWaypoint[]>([]);
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
  const [hospitals, setHospitals] = useState<Array<{
    hospitalId: number;
    hospitalName: string;
    hospitalAdress: string;
    hospitalCity: string;
    hospitalPostal: string;
    hospitalLatitude: string;
    hospitalLongitude: string;
  }>>([]);
  const [hospitalsDialogOpen, setHospitalsDialogOpen] = useState(false);

  const fetchFlightInfo = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/drones/${droneId}/flight_info`);
      if (!response.ok) {
        throw new Error('Failed to fetch flight info');
      }
      const data = await response.json();
      
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
      const response = await fetch(`http://localhost:3000/api/drones/${droneId}/mission/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start mission');
      }
      
      alert('Mission démarrée avec succès !');
      await fetchFlightInfo();
    } catch (err) {
      console.error('Error starting mission:', err);
      alert(`Erreur lors du démarrage de la mission: ${err}`);
    }
  };

  const handleReturnHome = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/drones/${droneId}/return-home`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to return home');
      }
      
      alert('Drone retourne à la base !');
      await fetchFlightInfo();
    } catch (err) {
      console.error('Error returning home:', err);
      alert(`Erreur lors du retour à la base: ${err}`);
    }
  };

  const handleCreateMission = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/drones/${droneId}/mission/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create mission');
      }
      
      alert('Mission créée avec succès !');
      setMissionDialogOpen(false);
      await fetchFlightInfo();
    } catch (err) {
      console.error('Error creating mission:', err);
      alert(`Erreur lors de la création de la mission: ${err}`);
    }
  };

  const handleModifyMission = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/drones/${droneId}/mission/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: modifyData.filename,
          seq: modifyData.seq,
          updates: {
            lat: modifyData.lat,
            lon: modifyData.lon,
            alt: modifyData.alt
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to modify mission');
      }
      
      alert('Mission modifiée avec succès !');
      setModifyDialogOpen(false);
      await fetchFlightInfo();
    } catch (err) {
      console.error('Error modifying mission:', err);
      alert(`Erreur lors de la modification de la mission: ${err}`);
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

  const fetchHospitals = async () => {
    try {
      console.log('Fetching hospitals...');
      const response = await fetch('http://localhost:3000/api/hospitals');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Hospitals data:', data);
        setHospitals(data);
      } else {
        console.error('Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const createMissionToHospital = async (hospital: {
    hospitalId: number;
    hospitalName: string;
    hospitalLatitude: string;
    hospitalLongitude: string;
  }) => {
    try {
      // Créer la mission de livraison
      const missionResponse = await fetch(`http://localhost:3000/api/drones/${droneId}/delivery-mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLat: 47.2098952,  // Position du centre de donation (Nantes)
          pickupLon: -1.5513221,
          deliveryLat: parseFloat(hospital.hospitalLatitude),
          deliveryLon: parseFloat(hospital.hospitalLongitude),
          altitude: 50
        })
      });

      if (missionResponse.ok) {
        // Démarrer la mission
        const startResponse = await fetch(`http://localhost:3000/api/drones/${droneId}/mission/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (startResponse.ok) {
          alert(`Mission créée et démarrée vers ${hospital.hospitalName}!`);
          setHospitalsDialogOpen(false);
          await fetchFlightInfo();
        } else {
          throw new Error('Erreur lors du démarrage de la mission');
        }
      } else {
        throw new Error('Erreur lors de la création de la mission');
      }
    } catch (error) {
      console.error('Mission error:', error);
      alert(`Erreur: ${error}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchFlightInfo();
      await fetchHospitals();
    };
    
    loadData();
    
    // Refresh flight info every 5 seconds
    const interval = setInterval(() => {
      fetchFlightInfo();
    }, 5000);
    return () => clearInterval(interval);
  }, [droneId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

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
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri'
            />
            <MapClickHandler />
            <Marker 
              position={[flightInfo.latitude, flightInfo.longitude]}
              icon={createDroneIcon(
                flightInfo.heading_deg, 
                flightInfo.movement_track_deg, 
                flightInfo.horizontal_speed_m_s > 0.1
              )}
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
                    <span style={{color: '#00ff00'}}>🡹 En mouvement</span>
                  ) : (
                    <span style={{color: '#999'}}>⏸ Stationnaire</span>
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
            disabled={!flightInfo?.is_armed}
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
              hospitals.map((hospital) => (
              <Paper 
                key={hospital.hospitalId}
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    boxShadow: 2
                  }
                }}
                onClick={() => createMissionToHospital(hospital)}
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
                      Lat: {parseFloat(hospital.hospitalLatitude).toFixed(6)}, 
                      Lon: {parseFloat(hospital.hospitalLongitude).toFixed(6)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="primary">
                      Cliquer pour créer mission
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHospitalsDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DroneDetailView;