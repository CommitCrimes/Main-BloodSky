import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  Visibility as VisibilityIcon,
  Air as AirIcon,
  Thermostat as ThermostatIcon,
  OpacityOutlined as HumidityIcon,
  Cloud as CloudIcon,
  Navigation as NavigationIcon,
} from '@mui/icons-material';
import { getCurrentWeather, getForecastByDate } from '@/api/weather';
import { hospitalApi } from '@/api/hospital';
import { donationCenterApi } from '@/api/donation_center';

interface DonationCenterFromDB {
  centerId: number;
  centerCity: string;
  centerPostal: number;
  centerAdress: string;
  centerLatitude: string | null;
  centerLongitude: string | null;
}


type WeatherPoint = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'hospital' | 'donation_center' | 'reference';
  priority: 'high' | 'medium' | 'low';
  address?: string;
  city?: string;
  showInFocus?: boolean;
  showInRegion?: boolean;
};

type CityFocus = {
  city: string;
  coords: { lat: number; lon: number };
  pointCount: number;
};

const CITY_REFERENCE_POINTS: WeatherPoint[] = [
  { 
    id: 'nantes-region', 
    name: 'Nantes', 
    lat: 47.2184, 
    lon: -1.5536, 
    type: 'reference',
    priority: 'high',
    city: 'Nantes',
    showInFocus: false,
    showInRegion: true
  },
  { 
    id: 'angers', 
    name: 'Angers', 
    lat: 47.4784, 
    lon: -0.5632, 
    type: 'reference',
    priority: 'medium',
    city: 'Angers',
    showInFocus: false,
    showInRegion: true
  },
  { 
    id: 'le-mans', 
    name: 'Le Mans', 
    lat: 48.0061, 
    lon: 0.1996, 
    type: 'reference',
    priority: 'medium',
    city: 'Le Mans',
    showInFocus: false,
    showInRegion: true
  },
  { 
    id: 'rennes', 
    name: 'Rennes', 
    lat: 48.1173, 
    lon: -1.6778, 
    type: 'reference',
    priority: 'medium',
    city: 'Rennes',
    showInFocus: false,
    showInRegion: true
  },
  { 
    id: 'tours', 
    name: 'Tours', 
    lat: 47.3941, 
    lon: 0.6848, 
    type: 'reference',
    priority: 'low',
    city: 'Tours',
    showInFocus: false,
    showInRegion: true
  },
];


const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getPriorityByDistance = (distanceKm: number): 'high' | 'medium' | 'low' => {
  if (distanceKm < 25) return 'high';
  if (distanceKm < 50) return 'medium';
  return 'low';
};

const extractCityFocus = async (): Promise<CityFocus[]> => {
  const cityMap = new Map<string, { coords: { lat: number; lon: number }; count: number }>();
  
  try {
    const hospitals = await hospitalApi.getAll();    
    const hospitalPoints = hospitals
      .filter(h => h.hospitalLatitude && h.hospitalLongitude && h.hospitalCity)
      .map(h => ({
        city: h.hospitalCity!.toUpperCase().trim(),
        lat: parseFloat(h.hospitalLatitude!),
        lon: parseFloat(h.hospitalLongitude!)
      }));

    const donationCenters = await donationCenterApi.getAllCenters() as unknown as DonationCenterFromDB[];    
    const donationCenterPoints = donationCenters
      .filter(dc => dc.centerLatitude !== null && dc.centerLatitude !== undefined && 
                    dc.centerLongitude !== null && dc.centerLongitude !== undefined &&
                    dc.centerCity)
      .map(dc => ({
        city: dc.centerCity.toUpperCase().trim(),
        lat: parseFloat(dc.centerLatitude!),
        lon: parseFloat(dc.centerLongitude!)
      }));

    const allPoints = [...hospitalPoints, ...donationCenterPoints];
    
    for (const point of allPoints) {
      if (cityMap.has(point.city)) {
        const existing = cityMap.get(point.city)!;
        existing.coords.lat = (existing.coords.lat * existing.count + point.lat) / (existing.count + 1);
        existing.coords.lon = (existing.coords.lon * existing.count + point.lon) / (existing.count + 1);
        existing.count += 1;
      } else {
        cityMap.set(point.city, {
          coords: { lat: point.lat, lon: point.lon },
          count: 1
        });
      }
    }

    return Array.from(cityMap.entries())
      .map(([city, data]) => ({
        city: city,
        coords: data.coords,
        pointCount: data.count
      }))
      .sort((a, b) => b.pointCount - a.pointCount);

  } catch (error) {
    console.error('Erreur lors de l\'extraction des villes:', error);
    return [];
  }
};

// recup des points meteo depuis la bdd avec système multi-villes
const fetchWeatherPoints = async (selectedCityFocus?: CityFocus): Promise<WeatherPoint[]> => {
  const focusPoints: WeatherPoint[] = []; // Points BDD pour vue Focus
  const regionPoints: WeatherPoint[] = [...CITY_REFERENCE_POINTS]; // Points région (grandes villes)
  
  let cityFocus = selectedCityFocus;
  if (!cityFocus) {
    const cities = await extractCityFocus();
    cityFocus = cities[0] || { city: 'NANTES', coords: { lat: 47.2184, lon: -1.5536 }, pointCount: 0 };
  }

  try {
    const hospitals = await hospitalApi.getAll();    
    const hospitalPoints = hospitals
      .filter(h => h.hospitalLatitude && h.hospitalLongitude)
      .map(h => {
        const lat = parseFloat(h.hospitalLatitude!);
        const lon = parseFloat(h.hospitalLongitude!);
        const distance = getDistanceKm(lat, lon, cityFocus!.coords.lat, cityFocus!.coords.lon);
                
        return {
          id: `hospital-${h.hospitalId}`,
          name: h.hospitalName,
          lat,
          lon,
          type: 'hospital' as const,
          priority: getPriorityByDistance(distance),
          address: h.hospitalAdress || undefined,
          city: h.hospitalCity || undefined,
          showInFocus: true,
          showInRegion: false,
        };
      });

    const donationCenters = await donationCenterApi.getAllCenters() as unknown as DonationCenterFromDB[];    
    const donationCenterPoints = donationCenters
      .filter(dc => dc.centerLatitude !== null && dc.centerLatitude !== undefined && 
                    dc.centerLongitude !== null && dc.centerLongitude !== undefined)
      .map(dc => {
        const lat = parseFloat(dc.centerLatitude!);
        const lon = parseFloat(dc.centerLongitude!);
        const distance = getDistanceKm(lat, lon, cityFocus!.coords.lat, cityFocus!.coords.lon);
                
        return {
          id: `donation-center-${dc.centerId}`,
          name: dc.centerCity,
          lat,
          lon,
          type: 'donation_center' as const,
          priority: getPriorityByDistance(distance),
          address: dc.centerAdress || undefined,
          city: dc.centerCity || undefined,
          showInFocus: true,
          showInRegion: false,
        };
      });

    focusPoints.push(...hospitalPoints, ...donationCenterPoints);
  } catch (error) {
    console.error('Erreur lors du chargement des points météo depuis la BDD:', error);
  }
  const allPoints = [...focusPoints, ...regionPoints];
  return allPoints;
};

type CurrentWeather = {
  main?: { 
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  wind?: { 
    speed?: number;
    deg?: number;
    gust?: number;
  };
  weather?: Array<{ 
    description?: string; 
    icon?: string;
    main?: string;
  }>;
  visibility?: number;
  clouds?: { all?: number };
  rain?: { '1h'?: number };
  name?: string;
  sys?: {
    sunrise?: number;
    sunset?: number;
  };
};

type ForecastStep = {
  dt: number;
  dt_txt: string;
  main?: { 
    temp?: number;
    temp_min?: number;
    temp_max?: number;
    humidity?: number;
  };
  wind?: { 
    speed?: number;
    deg?: number;
  };
  weather?: Array<{ 
    description?: string; 
    icon?: string;
    main?: string;
  }>;
  visibility?: number;
  pop?: number;
};

type SelectedPointState = {
  point: WeatherPoint;
  loading: boolean;
  steps: ForecastStep[];
  targetDate: Date;
  currentWeather?: CurrentWeather;
  error?: string | null;
};

const fmtTemp = (t?: number) =>
  typeof t === 'number' && Number.isFinite(t) ? `${Math.round(t)}°C` : '—';
const fmtWind = (ms?: number) => {
  return typeof ms === 'number' ? `${Math.round(ms)} m/s` : '—';
};
const fmtVisibility = (m?: number) =>
  typeof m === 'number' ? `${Math.round(m / 1000)} km` : '—';
const fmtHumidity = (h?: number) =>
  typeof h === 'number' ? `${h}%` : '—';
const hourFromDt = (dt: string) => {
  const d = new Date(dt);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

//conditions de vol
const getFlightConditions = (weather?: CurrentWeather) => {
  if (!weather) return { status: 'unknown', color: '#gray', message: 'Données indisponibles' };
  
  const temp = weather.main?.temp || 0;
  const windSpeed = weather.wind?.speed || 0;
  const visibility = weather.visibility || 10000;
  const rain = weather.rain?.['1h'] || 0;
  const weatherMain = weather.weather?.[0]?.main?.toLowerCase() || '';
  
  // Conditions dangereuses
  if (windSpeed > 15 || temp < -10 || temp > 50 || visibility < 1000 || rain > 5) {
    return { status: 'dangerous', color: '#ef4444', message: 'Conditions dangereuses' };
  }
  
  // Conditions difficiles
  if (windSpeed > 10 || temp < 0 || temp > 35 || visibility < 5000 || rain > 1 || 
      ['thunderstorm', 'snow'].includes(weatherMain)) {
    return { status: 'difficult', color: '#f59e0b', message: 'Conditions difficiles' };
  }
  
  // Conditions acceptables
  if (windSpeed > 5 || visibility < 8000 || ['clouds', 'mist', 'fog'].includes(weatherMain)) {
    return { status: 'acceptable', color: '#3b82f6', message: 'Conditions acceptables' };
  }
  
  // Conditions optimales
  return { status: 'optimal', color: '#10b981', message: 'Conditions optimales' };
};

// Helpers dates
const addDays = (d: Date, n: number) => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  nd.setDate(nd.getDate() + n);
  return nd;
};
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dowShort = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(d).replace('.', '');

const getPointTypeStyle = (type: WeatherPoint['type']) => {
  switch (type) {
    case 'hospital':
      return { icon: '🏥', bgColor: 'rgba(239, 68, 68, 0.1)', borderAccent: '#ef4444' };
    case 'donation_center':
      return { icon: '🩸', bgColor: 'rgba(59, 130, 246, 0.1)', borderAccent: '#3b82f6' };
    case 'reference':
      return { icon: '📍', bgColor: 'rgba(16, 185, 129, 0.1)', borderAccent: '#10b981' };
    default:
      return { icon: '📌', bgColor: 'rgba(107, 114, 128, 0.1)', borderAccent: '#6b7280' };
  }
};

function createWeatherIcon(point: WeatherPoint, weather?: CurrentWeather) {
  const conditions = getFlightConditions(weather);
  const temp = fmtTemp(weather?.main?.temp);
  const wind = fmtWind(weather?.wind?.speed);
  const typeStyle = getPointTypeStyle(point.type);
  const isHighPriority = point.priority === 'high';
  
  // Tailles réduites et responsives
  const baseSize = isHighPriority ? 160 : point.priority === 'medium' ? 135 : 110;
  const baseFontSize = isHighPriority ? 13 : point.priority === 'medium' ? 11 : 9;
  
  return `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88));
      border: 2px solid ${conditions.color};
      border-radius: 12px;
      padding: 8px;
      min-width: ${baseSize}px;
      font-family: 'Share Tech', monospace;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      box-shadow: 
        0 8px 32px rgba(0,0,0,0.15), 
        0 4px 16px rgba(0,0,0,0.1),
        inset 0 1px 0 rgba(255,255,255,0.6);
    " onmouseover="this.style.transform='scale(1.05) translateY(-2px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='scale(1) translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.1)';">
      
      <!-- En-tête avec type et nom -->
      <div style="
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        padding: 4px 8px;
        background: ${typeStyle.bgColor};
        border: 1px solid ${typeStyle.borderAccent}40;
        border-radius: 12px;
        width: 100%;
        justify-content: center;
      ">
        <span style="font-size: ${baseFontSize + 2}px;">${typeStyle.icon}</span>
        <div style="
          font-weight: 700; 
          font-size: ${baseFontSize}px; 
          color: #1a1a1a; 
          text-align: center;
          line-height: 1.2;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          flex: 1;
        ">
          ${point.name}
        </div>
      </div>
      
      <!-- Infos météo -->
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        width: 100%;
        margin-bottom: 8px;
        padding: 0 4px;
      ">
        <div style="
          font-size: ${baseFontSize + 8}px; 
          font-weight: 800; 
          color: ${conditions.color};
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        ">
          ${temp}
        </div>
        <div style="
          font-size: ${baseFontSize - 1}px; 
          color: #555;
          display: flex;
          align-items: center;
          gap: 2px;
        ">
          <span>💨</span>
          <span>${wind}</span>
        </div>
      </div>
      
      <!-- Conditions de vol -->
      <div style="
        background: linear-gradient(135deg, ${conditions.color}, ${conditions.color}dd);
        color: white;
        padding: 6px 10px;
        border-radius: 10px;
        font-size: ${baseFontSize - 2}px;
        font-weight: 700;
        text-align: center;
        width: 100%;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
      ">
        ${conditions.message}
      </div>
      
      <!-- Adresse si disponible -->
      ${point.city ? `
        <div style="
          font-size: ${baseFontSize - 4}px;
          color: #666;
          margin-top: 4px;
          text-align: center;
          opacity: 0.8;
        ">
          📍 ${point.city}
        </div>
      ` : ''}
    </div>
  `;
}

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<Record<string, CurrentWeather>>({});
  const [mainCenterWeather, setMainCenterWeather] = useState<CurrentWeather | null>(null);
  const [mainCenterName, setMainCenterName] = useState<string>('Centre de Don Principal');
  const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([]);
  const [availableCities, setAvailableCities] = useState<CityFocus[]>([]);
  const [selectedCityFocus, setSelectedCityFocus] = useState<CityFocus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'focus' | 'region'>('focus');

  const [selected, setSelected] = useState<SelectedPointState | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Charger les villes disponibles et initialiser
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cities = await extractCityFocus();
        if (!mounted) return;
        
        setAvailableCities(cities);
        
        if (cities.length > 0) {
          setSelectedCityFocus(cities[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des villes:', error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCityFocus) return;
    
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        
        const points = await fetchWeatherPoints(selectedCityFocus);
        if (!mounted) return;
        setWeatherPoints(points);
        
        const donationCenters = points.filter(p => p.type === 'donation_center');
        const mainCenter = donationCenters.find(c => c.priority === 'high') || donationCenters[0];
        
        if (mainCenter) {
          const mainCenterData = await getCurrentWeather(mainCenter.lat, mainCenter.lon, 'fr') as CurrentWeather;
          if (mounted) {
            setMainCenterWeather(mainCenterData);
            setMainCenterName(mainCenter.name);
          }
        } else {
          console.log('Aucun centre de don trouvé pour le point principal');
        }

        const results = await Promise.allSettled(
          points.map(async (point) => ({
            id: point.id,
            data: (await getCurrentWeather(point.lat, point.lon, 'fr')) as CurrentWeather,
          }))
        );
        if (!mounted) return;

        const byId: Record<string, CurrentWeather> = {};
        for (const r of results) {
          if (r.status === 'fulfilled') {
            byId[r.value.id] = r.value.data;
          }
        }
        setWeatherData(byId);
        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Erreur lors du chargement des données météo.');
          console.error('Erreur météo:', e);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedCityFocus]);

  // Remettre le scroll au début quand on change de point/date
  useEffect(() => {
    if (listRef.current) listRef.current.scrollLeft = 0;
  }, [selected?.point.id, selected?.targetDate]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (viewMode === 'focus' && selectedCityFocus) {
      return [selectedCityFocus.coords.lat, selectedCityFocus.coords.lon];
    }
    return [47.0, -1.5];
  }, [viewMode, selectedCityFocus]);

  const mapZoom = useMemo(() => {
    return viewMode === 'focus' ? 10 : 8;
  }, [viewMode]);

  // Générer des DivIcons par point météo
  const weatherIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    for (const point of weatherPoints) {
      const weather = weatherData[point.id];
      icons[point.id] = L.divIcon({
        className: 'weather-point-icon',
        html: createWeatherIcon(point, weather),
        iconSize: point.priority === 'high' ? [170, 110] : point.priority === 'medium' ? [145, 95] : [120, 80],
        iconAnchor: point.priority === 'high' ? [85, 110] : point.priority === 'medium' ? [72, 95] : [60, 80],
      });
    }
    return icons;
  }, [weatherPoints, weatherData]);

  // Récupère les prévisions pour un point/date
  const fetchForecast = async (point: WeatherPoint, date: Date) => {
    setSelected((prev) => ({
      point,
      loading: true,
      steps: prev?.steps ?? [],
      targetDate: date,
      currentWeather: weatherData[point.id],
      error: null,
    }));
    try {
      const steps = await getForecastByDate(point.lat, point.lon, date, 'fr');
      setSelected({
        point,
        loading: false,
        steps,
        targetDate: date,
        currentWeather: weatherData[point.id],
        error: null,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setSelected({
        point,
        loading: false,
        steps: [],
        targetDate: date,
        currentWeather: weatherData[point.id],
        error: e?.message || 'Impossible de charger les prévisions.',
      });
    }
  };

  // Clic sur un point météo → ouvrir panneau (date par défaut = aujourd'hui)
  const handlePointClick = async (point: WeatherPoint) => {
    const scrollPosition = window.scrollY;
    const today = addDays(new Date(), 0);
    await fetchForecast(point, today);
    window.scrollTo(0, scrollPosition);
  };

  // Options de dates J → J+4
  const dateOptions = useMemo(() => {
    const base = addDays(new Date(), 0);
    return Array.from({ length: 5 }, (_, i) => addDays(base, i));
  }, []);
  const selectedKey = selected ? ymd(selected.targetDate) : ymd(addDays(new Date(), 0));

  const labelFor = (d: Date, idx: number) => {
    if (idx === 0) return "Auj.";
    if (idx === 1) return "Dem.";
    return dowShort(d);
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: { xs: '100dvh', sm: '100vh' }, 
      overflowY: 'auto',
      overflowX: 'hidden',
      '&::-webkit-scrollbar': { display: 'none' },
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      background: 'linear-gradient(135deg, #e3f8fe 0%, #f0f9ff 50%, #e0f2fe 100%)',
      '& .leaflet-container': {
        fontSize: { xs: '14px', sm: '16px' }
      },
      '& .weather-point-icon': {
        transform: { xs: 'scale(0.85)', sm: 'scale(1)' }
      }
    }}>
      
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: { xs: 8, sm: 15, md: 20 },
          left: { xs: 8, sm: 10, md: '50%' },
          right: { xs: 8, sm: 10, md: 'auto' },
          transform: { xs: 'none', sm: 'none', md: 'translateX(-50%)' },
          zIndex: 1000,
          px: { xs: 1, sm: 1.5, md: 2.5 },
          py: { xs: 0.8, sm: 1, md: 1.5 },
          borderRadius: { xs: 2, sm: 2.5, md: 3 },
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: { xs: 1, sm: 1.2, md: 2 },
          maxWidth: { xs: 'calc(100vw - 16px)', sm: 'calc(100vw - 20px)', md: '800px' },
        }}
      >
        <Typography 
          variant="h6"
          sx={{ 
            fontFamily: 'Share Tech, monospace', 
            color: '#1a1a1a',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 0.5, sm: 0.8, md: 1 },
            textAlign: 'center',
            fontSize: { xs: '0.8rem', sm: '0.95rem', md: '1.1rem' }
          }}
        >
          <CloudIcon sx={{ color: '#3b82f6', fontSize: { xs: 16, sm: 18, md: 20 } }} />
          <Box component="span" sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}>
            Météo Droniste - {selectedCityFocus?.city || 'Multi-Villes'}
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'inline', md: 'none' } }}>
            Météo - {selectedCityFocus?.city || 'Multi-Villes'}
          </Box>
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: { xs: 1, sm: 1.5 }, 
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'center'
        }}>
          {availableCities.length > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: { xs: '100%', sm: 'auto' } }}>
              {availableCities.length <= 3 ? (
                // Affichage simple pour 2-3 villes
                <ToggleButtonGroup
                  value={selectedCityFocus?.city || ''}
                  exclusive
                  onChange={(_, newValue: string | null) => {
                    if (newValue) {
                      const city = availableCities.find(c => c.city === newValue);
                      if (city) setSelectedCityFocus(city);
                    }
                  }}
                  size="small"
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    '& .MuiToggleButton-root': {
                      fontFamily: 'Share Tech, monospace',
                      textTransform: 'none',
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                      px: { xs: 0.8, sm: 1, md: 1.2 },
                      py: { xs: 0.4, sm: 0.5, md: 0.5 },
                      minWidth: { xs: '50px', sm: '70px', md: 'auto' },
                      flex: { xs: 1, sm: 'none' },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }}
                >
                  {availableCities.map((city) => (
                    <ToggleButton key={city.city} value={city.city}>
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {city.city} ({city.pointCount})
                      </Box>
                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                        {city.city.length > 5 ? city.city.substring(0, 5) : city.city}
                      </Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              ) : (
                // Système de cycle compact pour 4+ villes
                <Box sx={{ 
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <ToggleButtonGroup
                    value={selectedCityFocus?.city || ''}
                    exclusive
                    onChange={(_, newValue: string | null) => {
                      if (newValue) {
                        const currentIndex = availableCities.findIndex(c => c.city === selectedCityFocus?.city);
                        const nextIndex = (currentIndex + 1) % availableCities.length;
                        setSelectedCityFocus(availableCities[nextIndex]);
                      }
                    }}
                    size="small"
                    sx={{
                      width: '100%',
                      maxWidth: { xs: '200px', sm: '250px' },
                      '& .MuiToggleButton-root': {
                        fontFamily: 'Share Tech, monospace',
                        textTransform: 'none',
                        fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                        px: { xs: 0.8, sm: 1.2, md: 1.5 },
                        py: { xs: 0.4, sm: 0.5, md: 0.5 },
                        width: '100%',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        position: 'relative'
                      }
                    }}
                  >
                    <ToggleButton value={selectedCityFocus?.city || ''}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                            🏙️ {selectedCityFocus?.city || 'Ville'} ({selectedCityFocus?.pointCount || 0})
                          </Box>
                          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                            🏙️ {selectedCityFocus?.city || 'Ville'}
                          </Box>
                        </Box>
                        <Box component="span" sx={{ 
                          fontSize: '0.7em', 
                          opacity: 0.7, 
                          ml: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.2
                        }}>
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                            {availableCities.findIndex(c => c.city === selectedCityFocus?.city) + 1}/{availableCities.length}
                          </Box>
                          ⟲
                        </Box>
                      </Box>
                    </ToggleButton>
                  </ToggleButtonGroup>
                  
                  {/* Indicateur discret pour mobile */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: { xs: 'block', sm: 'none' },
                      fontSize: '0.55rem',
                      color: '#999',
                      fontFamily: 'Share Tech, monospace',
                      mt: 0.3,
                      textAlign: 'center',
                      opacity: 0.8
                    }}
                  >
                    {availableCities.findIndex(c => c.city === selectedCityFocus?.city) + 1}/{availableCities.length} • Tap pour suivant
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newValue) => newValue && setViewMode(newValue)}
            size="small"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              '& .MuiToggleButton-root': {
                fontFamily: 'Share Tech, monospace',
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.4, sm: 0.6, md: 1 },
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                px: { xs: 1, sm: 1.2, md: 1.5 },
                flex: { xs: 1, sm: 'none' }
              }
            }}
          >
            <ToggleButton value="focus">
              <MyLocationIcon sx={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Focus
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                F
              </Box>
            </ToggleButton>
            <ToggleButton value="region">
              <NavigationIcon sx={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Région
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                R
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {mainCenterWeather && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            top: { xs: 120, sm: 140, md: 20 },
            right: { xs: 10, sm: 20 },
            left: { xs: 10, md: 'auto' },
            width: { xs: 'auto', md: 280 },
            maxWidth: { xs: 'calc(100vw - 20px)', md: '280px' },
            zIndex: 999,
            borderRadius: { xs: 2, sm: 3 },
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            border: `3px solid ${getFlightConditions(mainCenterWeather).color}`,
          }}
        >
          <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
            <Typography 
              variant="h6"
              sx={{ 
                fontFamily: 'Share Tech, monospace',
                color: '#1a1a1a',
                mb: { xs: 0.5, sm: 1 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: { xs: '0.8rem', sm: '1rem' }
              }}
            >
              🩸 {mainCenterName}
              <Chip
                label={getFlightConditions(mainCenterWeather).message}
                size="small"
                sx={{
                  backgroundColor: getFlightConditions(mainCenterWeather).color,
                  color: 'white',
                  fontFamily: 'Share Tech, monospace',
                  fontWeight: 600,
                  fontSize: { xs: '0.6rem', sm: '0.7rem' }
                }}
              />
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.2, sm: 1.6 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 0.8 } }}>
                  <ThermostatIcon sx={{ color: '#ef4444', fontSize: { xs: 16, sm: 18 } }} />
                  <Typography sx={{ fontFamily: 'Share Tech, monospace', fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {fmtTemp(mainCenterWeather.main?.temp)}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'Share Tech, monospace', color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  Ressenti {fmtTemp(mainCenterWeather.main?.feels_like)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 0.8 } }}>
                  <AirIcon sx={{ color: '#3b82f6', fontSize: { xs: 16, sm: 18 } }} />
                  <Typography sx={{ fontFamily: 'Share Tech, monospace', fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {fmtWind(mainCenterWeather.wind?.speed)}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'Share Tech, monospace', color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  {mainCenterWeather.weather?.[0]?.description}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 0.8 } }}>
                  <VisibilityIcon sx={{ color: '#10b981', fontSize: { xs: 14, sm: 16 } }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                    {fmtVisibility(mainCenterWeather.visibility)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 0.8 } }}>
                  <HumidityIcon sx={{ color: '#6366f1', fontSize: { xs: 14, sm: 16 } }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                    {fmtHumidity(mainCenterWeather.main?.humidity)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
      
      {/* Carte en fond */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MapContainer
          key={`${viewMode}-${mapZoom}`}
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/">Humanitarian OpenStreetMap Team</a>'
          />
          
          {viewMode === 'focus' && selectedCityFocus && (
            <Circle
              center={[selectedCityFocus.coords.lat, selectedCityFocus.coords.lon]}
              radius={50000} // 50km de rayon
              pathOptions={{
                color: '#3b82f6',
                weight: 2,
                opacity: 0.6,
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
              }}
            />
          )}
          
          {weatherPoints.filter((point) => {
            if (viewMode === 'focus') {
              return point.showInFocus;
            } else {
              return point.showInRegion;
            }
          }).map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lon]}
              icon={weatherIcons[point.id]}
              eventHandlers={{ click: () => handlePointClick(point) }}
              zIndexOffset={
                point.priority === 'high' ? 1000 : 
                point.priority === 'medium' ? 500 : 100
              }
            />
          ))}
        </MapContainer>
      </Box>

      {/* Overlay chargement */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 1500,
          }}
        >
          <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
          <Typography 
            sx={{ 
              mt: 2, 
              fontFamily: 'Share Tech, monospace', 
              color: '#1a1a1a',
              fontWeight: 600,
            }}
          >
            Chargement des données météo...
          </Typography>
        </Box>
      )}

      {/* Erreur globale */}
      {error && !loading && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 3,
            zIndex: 1500,
            maxWidth: 400,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
          }}
        >
          <Typography 
            color="error" 
            variant="h6" 
            sx={{ fontFamily: 'Share Tech, monospace', mb: 1 }}
          >
            Erreur de chargement
          </Typography>
          <Typography 
            color="error" 
            variant="body2"
            sx={{ fontFamily: 'Share Tech, monospace' }}
          >
            {error}
          </Typography>
        </Paper>
      )}

      {/* Panneau détails (bas-gauche) */}
      {selected && (
        <Paper
          elevation={12}
          sx={{
            position: 'absolute',
            bottom: { xs: 10, sm: 20 },
            left: { xs: 10, sm: 20 },
            right: { xs: 10, sm: 'auto' },
            width: { xs: 'auto', sm: 520, md: 580, lg: 620 },
            maxWidth: { xs: 'calc(100vw - 20px)', sm: '580px', lg: '620px' },
            maxHeight: { xs: 'calc(45vh)', sm: '500px', lg: '550px' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: { xs: 2, sm: 3 },
            zIndex: 1200,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(15px)',
            border: `3px solid ${getFlightConditions(selected.currentWeather).color}`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.9)`,
            transform: 'translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 25px 70px rgba(0,0,0,0.2), 0 12px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.9)`,
            }
          }}
        >
          {/* En-tête avec conditions de vol amélioré */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              background: `linear-gradient(135deg, ${getFlightConditions(selected.currentWeather).color}20, ${getFlightConditions(selected.currentWeather).color}08)`,
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, ${getFlightConditions(selected.currentWeather).color}, ${getFlightConditions(selected.currentWeather).color}80)`,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: 'Share Tech, monospace', 
                    color: '#1a1a1a', 
                    fontWeight: 800,
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    lineHeight: 1.2,
                    mb: 0.5
                  }}
                >
                  {getPointTypeStyle(selected.point.type).icon} {selected.point.name}
                </Typography>
                {selected.point.address && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'Share Tech, monospace', 
                      color: '#666',
                      fontSize: '0.85rem',
                      opacity: 0.9
                    }}
                  >
                    📍 {selected.point.address}, {selected.point.city}
                  </Typography>
                )}
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setSelected(null)}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip
                label={getFlightConditions(selected.currentWeather).message}
                sx={{
                  backgroundColor: getFlightConditions(selected.currentWeather).color,
                  color: 'white',
                  fontFamily: 'Share Tech, monospace',
                  fontWeight: 700,
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  px: { xs: 1.2, sm: 1.5 },
                  py: 0.5,
                  boxShadow: `0 4px 15px ${getFlightConditions(selected.currentWeather).color}40`,
                  minWidth: 'auto',
                  maxWidth: { xs: '150px', sm: '180px' },
                }}
              />
              {selected.currentWeather?.main?.temp && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.9, sm: 0.5 }, flexWrap: 'wrap' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Share Tech, monospace', 
                      color: getFlightConditions(selected.currentWeather).color,
                      fontWeight: 800,
                      fontSize: { xs: '1rem', sm: '1.2rem' }
                    }}
                  >
                    {fmtTemp(selected.currentWeather.main.temp)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'Share Tech, monospace', 
                      color: '#666',
                      fontSize: { xs: '0.70rem', sm: '0.8rem' }
                    }}
                  >
                    💨 {fmtWind(selected.currentWeather.wind?.speed)}
                  </Typography>
                  {selected.currentWeather?.sys?.sunrise && selected.currentWeather?.sys?.sunset && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <Typography sx={{ fontSize: '0.75rem' }}>🌅</Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: 'Share Tech, monospace', 
                            color: '#666',
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          {new Date(selected.currentWeather.sys.sunrise * 1000).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <Typography sx={{ fontSize: '0.75rem' }}>🌇</Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: 'Share Tech, monospace', 
                            color: '#666',
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          {new Date(selected.currentWeather.sys.sunset * 1000).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* Sélecteur de date amélioré */}
          <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(248, 250, 252, 0.8)', display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              size="small"
              color="primary"
              exclusive
              value={selectedKey}
              onChange={(_, newValue: string | null) => {
                if (!newValue) return;
                const newDate = dateOptions.find((d) => ymd(d) === newValue) ?? addDays(new Date(), 0);
                fetchForecast(selected.point, newDate);
              }}
              sx={{
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  borderRadius: 2,
                  fontFamily: 'Share Tech, monospace',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                },
              }}
            >
              {dateOptions.map((d, idx) => (
                <ToggleButton
                  key={ymd(d)}
                  value={ymd(d)}
                  title={`${idx === 0 ? "Aujourd'hui" : idx === 1 ? 'Demain' : dowShort(d)} ${d
                    .getDate()
                    .toString()
                    .padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`}
                >
                  {labelFor(d, idx)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Prévisions horaires avec conditions de vol */}
          <Box
            ref={listRef}
            sx={{
              p: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              whiteSpace: 'nowrap',
              '&::-webkit-scrollbar': { display: 'none !important' }, // Chrome, Safari, Edge
              flex: 1,
              textAlign: 'center',
            }}
          >
            {selected.loading && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, py: 4 }}>
                <CircularProgress size={24} />
                <Typography 
                  variant="body2" 
                  sx={{ fontFamily: 'Share Tech, monospace', color: '#666' }}
                >
                  Chargement des prévisions détaillées...
                </Typography>
              </Box>
            )}

            {!selected.loading && selected.error && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography 
                  color="error" 
                  variant="body2" 
                  sx={{ fontFamily: 'Share Tech, monospace', display: 'inline-block' }}
                >
                  ❌ {selected.error}
                </Typography>
              </Box>
            )}

            {!selected.loading && !selected.error && selected.steps.length === 0 && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ fontFamily: 'Share Tech, monospace', display: 'inline-block' }}
                >
                  📭 Aucune donnée disponible pour cette date
                </Typography>
              </Box>
            )}

            {!selected.loading && !selected.error && selected.steps.length > 0 && (
              <Box sx={{ display: 'inline-flex', gap: 2, pr: 2 }}>
                {selected.steps.map((s, i) => {
                  const stepWeather = {
                    main: s.main,
                    wind: s.wind,
                    weather: s.weather,
                    visibility: s.visibility,
                  } as CurrentWeather;
                  const conditions = getFlightConditions(stepWeather);
                  const t = fmtTemp(s.main?.temp);
                  const w = fmtWind(s.wind?.speed);
                  const weatherMain = s.weather?.[0]?.main?.toLowerCase() || '';
                  const precipProb = s.pop ? Math.round(s.pop * 100) : 0;
                  
                  // Fonction pour obtenir l'emoji météo selon le type et l'heure
                  const getWeatherEmoji = (main: string, dtTxt: string) => {
                    // Extraire l'heure de dt_txt (format: "2024-01-15 18:00:00")
                    const hour = parseInt(dtTxt.split(' ')[1].split(':')[0]);
                    // Utiliser les vraies heures de lever/coucher si disponibles, sinon approximation
                    const sunrise = selected.currentWeather?.sys?.sunrise;
                    const sunset = selected.currentWeather?.sys?.sunset;
                    let isNight = hour < 6 || hour >= 19; // Défaut
                    
                    if (sunrise && sunset) {
                      const sunriseHour = new Date(sunrise * 1000).getHours();
                      const sunsetHour = new Date(sunset * 1000).getHours();
                      isNight = hour < sunriseHour || hour >= sunsetHour;
                    }
                    
                    switch(main) {
                      case 'clear': 
                        return isNight ? '🌙' : '☀️';
                      case 'clouds': 
                        return isNight ? '☁️🌙' : '☁️';
                      case 'rain': 
                        return isNight ? '🌧️🌙' : '🌧️';
                      case 'drizzle': 
                        return isNight ? '🌦️🌙' : '🌦️';
                      case 'thunderstorm': 
                        return isNight ? '⛈️🌙' : '⛈️';
                      case 'snow': 
                        return isNight ? '❄️🌙' : '❄️';
                      case 'mist': 
                      case 'fog': 
                        return isNight ? '🌫️🌙' : '🌫️';
                      default: 
                        return isNight ? '🌙' : '🌤️';
                    }
                  };
                  
                  return (
                    <Card
                      key={`${s.dt_txt}-${i}`}
                      variant="outlined"
                      sx={{
                        minWidth: { xs: 100, sm: 120 },
                        borderColor: conditions.color,
                        borderWidth: 2,
                        backgroundColor: `${conditions.color}08`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 8px 25px ${conditions.color}40`,
                        }
                      }}
                    >
                      <CardContent sx={{ p: { xs: 0.5, sm: 0.7 },height: '135px', textAlign: 'center' }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ fontFamily: 'Share Tech, monospace', fontWeight: 700, mb: 0.2, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {hourFromDt(s.dt_txt)}
                        </Typography>
                        
                        <Box sx={{ mb: 0.3 }}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontSize: { xs: '1.3rem', sm: '1.5rem' },
                              mb: 0.2,
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                            }}
                          >
                            {getWeatherEmoji(weatherMain, s.dt_txt)}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="h6" 
                          sx={{ fontFamily: 'Share Tech, monospace', fontWeight: 800, color: conditions.color, mb: 0.3, fontSize: { xs: '0.85rem', sm: '1rem' } }}
                        >
                          {t}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ fontFamily: 'Share Tech, monospace', color: '#666', mb: 0.3, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          💨 {w}
                        </Typography>
                        
                        {precipProb > 0 && (
                          <Typography 
                            variant="caption" 
                            sx={{ fontFamily: 'Share Tech, monospace', color: '#3b82f6', mb: 0.5, display: 'block' }}
                          >
                            🌧️ {precipProb}%
                          </Typography>
                        )}
                        
                        <Chip
                          label={conditions.message}
                          size="small"
                          sx={{
                            backgroundColor: conditions.color,
                            color: 'white',
                            fontFamily: 'Share Tech, monospace',
                            fontWeight: 600,
                            fontSize: '0.5rem',
                          }}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Weather;
