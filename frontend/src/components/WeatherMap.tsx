// src/components/Weather.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getCurrentWeather, getForecastByDate } from '@/api/weather';

type Region = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

// 13 régions métropolitaines (centroïdes approximatifs)
const REGIONS: Region[] = [
  { id: 'idf', name: 'Île-de-France', lat: 48.85, lon: 2.35 },
  { id: 'ara', name: 'Auvergne-Rhône-Alpes', lat: 45.5, lon: 4.3 },
  { id: 'paca', name: 'Provence-Alpes-Côte d’Azur', lat: 43.9, lon: 6.1 },
  { id: 'occ', name: 'Occitanie', lat: 43.6, lon: 2.0 },
  { id: 'na', name: 'Nouvelle-Aquitaine', lat: 45.0, lon: -0.5 },
  { id: 'ge', name: 'Grand Est', lat: 48.7, lon: 6.2 },
  { id: 'hdf', name: 'Hauts-de-France', lat: 50.3, lon: 2.8 },
  { id: 'bre', name: 'Bretagne', lat: 48.2, lon: -2.9 },
  { id: 'nor', name: 'Normandie', lat: 49.2, lon: 0.8 },
  { id: 'pdl', name: 'Pays de la Loire', lat: 47.3, lon: -0.7 },
  { id: 'cvl', name: 'Centre-Val de Loire', lat: 47.5, lon: 1.7 },
  { id: 'bfc', name: 'Bourgogne-Franche-Comté', lat: 47.3, lon: 5.3 },
  { id: 'cor', name: 'Corse', lat: 42.1, lon: 9.0 },
];

type CurrentWeather = {
  main?: { temp?: number };
  wind?: { speed?: number };
  weather?: Array<{ description?: string; icon?: string }>;
};

type ForecastStep = {
  dt_txt: string;
  main?: { temp?: number };
  wind?: { speed?: number };
  weather?: Array<{ description?: string; icon?: string }>;
};

type SelectedRegionState = {
  region: Region;
  loading: boolean;
  steps: ForecastStep[];
  targetDate: Date;
  error?: string | null;
};

const kmh = (ms?: number) => (typeof ms === 'number' ? Math.round(ms * 3.6) : null);
const fmtTemp = (t?: number) =>
  typeof t === 'number' && Number.isFinite(t) ? `${Math.round(t)}°C` : '—';
const fmtWind = (ms?: number) => {
  const k = kmh(ms);
  return k !== null ? `${k} km/h` : '—';
};
const hourFromDt = (dt: string) => {
  const d = new Date(dt);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
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

// Bloc HTML injecté dans un DivIcon (cliquable)
function regionBoxHTML(name: string, temp: string, wind: string) {
  return `
  <div style="
    display:inline-block;
    background: rgba(255,255,255,0.92);
    border: 1px solid rgba(0,0,0,0.15);
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    border-radius: 10px;
    padding: 8px 10px;
    min-width: 150px;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji';
    cursor: pointer;
  ">
    <div style="font-weight:600; font-size:12px; color:#333; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
      ${name}
    </div>
    <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
      <div style="font-size:18px; font-weight:700;">${temp}</div>
      <div style="font-size:12px; color:#555;">Vent: ${wind}</div>
    </div>
  </div>
  `;
}

const Weather: React.FC = () => {
  const [current, setCurrent] = useState<Record<string, CurrentWeather>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<SelectedRegionState | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Charger la météo actuelle pour toutes les régions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled(
          REGIONS.map(async (r) => ({
            id: r.id,
            data: (await getCurrentWeather(r.lat, r.lon, 'fr')) as CurrentWeather,
          }))
        );
        if (!mounted) return;

        const byId: Record<string, CurrentWeather> = {};
        for (const r of results) {
          if (r.status === 'fulfilled') {
            byId[r.value.id] = r.value.data;
          }
        }
        setCurrent(byId);
        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement des données météo.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Remettre le scroll au début quand on change de région/date
  useEffect(() => {
    if (listRef.current) listRef.current.scrollLeft = 0;
  }, [selected?.region.id, selected?.targetDate]);

  // Map centrée sur la France
  const center = useMemo<[number, number]>(() => [46.6, 2.5], []);

  // Générer des DivIcons par région (recalculés quand current change)
  const regionIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    for (const r of REGIONS) {
      const c = current[r.id];
      const temp = fmtTemp(c?.main?.temp);
      const wind = fmtWind(c?.wind?.speed);
      icons[r.id] = L.divIcon({
        className: 'region-weather-icon',
        html: regionBoxHTML(r.name, temp, wind),
        iconSize: [160, 48],
        iconAnchor: [80, 48], // ancre en bas-centre pour "au-dessus du point"
      });
    }
    return icons;
  }, [current]);

  // Récupère les prévisions pour une région/date
  const fetchForecast = async (region: Region, date: Date) => {
    setSelected((prev) => ({
      region,
      loading: true,
      steps: prev?.steps ?? [],
      targetDate: date,
      error: null,
    }));
    try {
      const steps = await getForecastByDate(region.lat, region.lon, date, 'fr');
      setSelected({ region, loading: false, steps, targetDate: date, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setSelected({
        region,
        loading: false,
        steps: [],
        targetDate: date,
        error: e?.message || 'Impossible de charger les prévisions.',
      });
    }
  };

  // Clic sur une région → ouvrir panneau (date par défaut = aujourd'hui)
  const handleRegionClick = async (region: Region) => {
    const today = addDays(new Date(), 0);
    await fetchForecast(region, today);
  };

  // Options de dates J → J+4
  const dateOptions = useMemo(() => {
    const base = addDays(new Date(), 0);
    return Array.from({ length: 5 }, (_, i) => addDays(base, i));
  }, []);
  const selectedKey = selected ? ymd(selected.targetDate) : ymd(addDays(new Date(), 0));

  const labelFor = (d: Date, idx: number) => {
    if (idx === 0) return 'J';
    return `J+${idx}`;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Carte en fond */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MapContainer
          center={center}
          zoom={6}
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri'
          />
          {REGIONS.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lon]}
              icon={regionIcons[r.id]}
              eventHandlers={{ click: () => handleRegionClick(r) }}
              zIndexOffset={1000}
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
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            background: 'rgba(255,255,255,0.25)',
            zIndex: (t) => t.zIndex.modal + 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Erreur globale */}
      {error && !loading && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 1.5,
            zIndex: (t) => t.zIndex.modal + 2,
          }}
        >
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Panneau détails (bas-gauche) */}
      {selected && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            width: 380,
            maxHeight: 380,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
            zIndex: (t) => t.zIndex.modal + 3,
            background: 'rgba(255,255,255,0.95)',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              Prévisions — {selected.region.name}
            </Typography>
            <IconButton size="small" onClick={() => setSelected(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Sélecteur de date (J → J+4) */}
          <Box
            sx={{
              px: 1.5,
              pt: 1,
              pb: 0.5,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <ToggleButtonGroup
              size="small"
              color="primary"
              exclusive
              value={selectedKey}
              onChange={(_, newValue: string | null) => {
                if (!newValue) return;
                const newDate = dateOptions.find((d) => ymd(d) === newValue) ?? addDays(new Date(), 0);
                fetchForecast(selected.region, newDate);
              }}
              sx={{
                display: 'flex',
                gap: 0.75,
                '& .MuiToggleButton-root': {
                  px: 1.25,
                  py: 0.5,
                  textTransform: 'none',
                  borderRadius: 2,
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

          {/* Liste horizontale scrollable des pas 3h */}
          <Box
            ref={listRef}
            sx={{
              p: 1.5,
              overflowX: 'auto',
              overflowY: 'hidden',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'thin',                 // Firefox
              scrollbarColor: 'rgba(0,0,0,0.3) transparent',
              '&::-webkit-scrollbar': { height: 6 },  // WebKit
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 3,
              },
              flex: 1,
            }}
          >
            {selected.loading && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} />
                <Typography variant="body2">Chargement des prévisions…</Typography>
              </Box>
            )}

            {!selected.loading && selected.error && (
              <Typography color="error" variant="body2" sx={{ display: 'inline-block' }}>
                {selected.error}
              </Typography>
            )}

            {!selected.loading && !selected.error && selected.steps.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ display: 'inline-block' }}>
                Aucune donnée disponible.
              </Typography>
            )}

            {!selected.loading && !selected.error && selected.steps.length > 0 && (
              <Box sx={{ display: 'inline-flex', gap: 1.25, pr: 1 }}>
                {selected.steps.map((s, i) => {
                  const t = fmtTemp(s.main?.temp);
                  const w = fmtWind(s.wind?.speed);
                  const desc = s.weather?.[0]?.description ?? '';
                  const icon = s.weather?.[0]?.icon;
                  return (
                    <Paper
                      key={`${s.dt_txt}-${i}`}
                      variant="outlined"
                      sx={{
                        px: 1.25,
                        py: 1,
                        minWidth: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {hourFromDt(s.dt_txt)}
                      </Typography>
                      {icon ? (
                        <img
                          alt={desc}
                          src={`https://openweathermap.org/img/wn/${icon}.png`}
                          width={36}
                          height={36}
                          style={{ imageRendering: 'crisp-edges' }}
                        />
                      ) : (
                        <Box sx={{ height: 36 }} />
                      )}
                      <Typography variant="body2">{t}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        {w}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        {desc}
                      </Typography>
                    </Paper>
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
