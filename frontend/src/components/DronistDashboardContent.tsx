import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import droneImage from '@/assets/drone2.png';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  HistoryOutlined,
  NotificationsOutlined,
  FlightTakeoffOutlined,
  CloudOutlined,
  WarningAmberOutlined,
  CheckCircleOutlined,
  WbSunnyOutlined,
  CloudQueueOutlined,
  ThunderstormOutlined,
  AcUnitOutlined,
  OpacityOutlined,
  AirOutlined
} from '@mui/icons-material';
import * as weather from '@/api/weather';
import { deliveryApi } from '@/api/delivery';
import { dronesApi } from '@/api/drone';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    feels_like: number;
  };
  weather: Array<{
    description: string;
    main: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  name: string;
}

interface WeatherForecast {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  dt_txt: string;
}

interface DronistDashboardContentProps {
  onNavigate: (view: string) => void;
}

const DronistDashboardContent: React.FC<DronistDashboardContentProps> = ({ onNavigate }) => {
  const auth = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const [deliveryStats, setDeliveryStats] = useState<{ name: string; vols: number; echecs: number }[]>([]);
  const [droneStatusData, setDronesStatus] = useState<{ name: string; value: number; color: string }[]>([]);

  const [recentNotifications, setRecentNotifications] = useState<{ id: number; type: 'success' | 'warning' | 'info'; message: string; time: string }[]>([]);

  const yMax = React.useMemo(() => {
    const top = deliveryStats.reduce((m, d) => Math.max(m, d.vols, d.echecs), 0);
    return Math.max(top, 4);
  }, [deliveryStats]);

  const yTicks = React.useMemo(
    () => Array.from({ length: yMax + 1 }, (_, i) => i),
    [yMax]
  );

  useEffect(() => {
    const loadWeather = async () => {
      setLoadingWeather(true);
      try {
        const lat = 47.2098952;    
        const lon = -1.5513221;
        const current = await weather.getCurrentWeather(lat, lon, 'fr');
        setWeatherData(current);
        const daily = await weather.getForecast(lat, lon, 'fr');
        setWeatherForecast(daily as unknown as WeatherForecast[]);
      } catch (e) {
        console.error('Erreur météo :', e);
      } finally {
        setLoadingWeather(false);
      }
    };

    loadWeather();
  }, []);

  useEffect(() => {
    type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled';

    type DeliveryLike = {
      deliveryId: number;
      deliveryStatus?: string | DeliveryStatus;
      requestDate?: string | Date | null;
      deliveryDate?: string | Date | null;
      dteValidation?: string | Date | null;
    };

    const parseDate = (v?: string | Date | null): Date | null =>
      v == null ? null : v instanceof Date ? v : new Date(v);

    const startOfDay = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const dayKey = (d: Date) => startOfDay(d).toISOString();

    const frDayShort = (d: Date) =>
      d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');

    const timeAgo = (from: Date) => {
      const diff = Date.now() - from.getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return 'à l’instant';
      if (m < 60) return `il y a ${m} min`;
      const h = Math.floor(m / 60);
      if (h < 24) return `il y a ${h} h`;
      const d = Math.floor(h / 24);
      return `il y a ${d} j`;
    };

    const load = async () => {
      const centerId = auth.user?.role?.centerId;
      const raw = centerId != null
        ? await deliveryApi.getByCenterId(centerId)
        : await deliveryApi.getAll();

      const list: DeliveryLike[] = raw.map((d) => ({
        deliveryId: (d as { deliveryId: number }).deliveryId,
        deliveryStatus: (d as { deliveryStatus?: string }).deliveryStatus ?? 'pending',
        requestDate: (d as { requestDate?: string | Date | null }).requestDate ?? null,
        deliveryDate: (d as { deliveryDate?: string | Date | null }).deliveryDate ?? null,
        dteValidation: (d as { dteValidation?: string | Date | null }).dteValidation ?? null,
      }));
      const today = startOfDay(new Date());
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d;
      });

      const buckets = new Map<string, { vols: number; echecs: number; date: Date }>();
      days.forEach((d) => buckets.set(dayKey(d), { vols: 0, echecs: 0, date: d }));

      list.forEach((it) => {
        const status = String(it.deliveryStatus).toLowerCase() as DeliveryStatus;
        const ref =
          status === 'delivered'
            ? parseDate(it.deliveryDate)
            : status === 'cancelled'
              ? parseDate(it.dteValidation) ?? parseDate(it.requestDate)
              : parseDate(it.requestDate);

        if (!ref) return;
        const slot = buckets.get(dayKey(ref));
        if (!slot) return;

        if (status === 'delivered') slot.vols += 1;
        else if (status === 'cancelled') slot.echecs += 1;
      });

      setDeliveryStats(
        days.map((d) => {
          const b = buckets.get(dayKey(d))!;
          return { name: frDayShort(d), vols: b.vols, echecs: b.echecs };
        })
      );
      const stamp = (x: DeliveryLike): Date =>
        parseDate(x.dteValidation) ?? parseDate(x.deliveryDate) ?? parseDate(x.requestDate) ?? new Date(0);

      const recent = [...list]
        .sort((a, b) => stamp(b).getTime() - stamp(a).getTime())
        .slice(0, 8)
        .map((it, idx) => {
          const when = stamp(it);
          const status = String(it.deliveryStatus).toLowerCase() as DeliveryStatus;
          if (status === 'delivered')
            return { id: idx, type: 'success' as const, message: `Livraison #${it.deliveryId} livrée`, time: timeAgo(when) };
          if (status === 'cancelled')
            return { id: idx, type: 'warning' as const, message: `Livraison #${it.deliveryId} annulée`, time: timeAgo(when) };
          if (status === 'in_transit')
            return { id: idx, type: 'info' as const, message: `Livraison #${it.deliveryId} en transit`, time: timeAgo(when) };
          return { id: idx, type: 'info' as const, message: `Livraison #${it.deliveryId} en attente`, time: timeAgo(when) };
        });

      setRecentNotifications(recent);
    };

    load();
  }, [auth.user?.role?.centerId]);

  useEffect(() => {
    type DroneItem = { droneStatus?: string | null };

    const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();

    const load = async () => {
      const drones = await dronesApi.list();
      let actifs = 0;
      let maintenance = 0;
      let hors = 0;
      (drones as DroneItem[]).forEach((d) => {
        const s = norm(d.droneStatus);
        if (['active', 'available', 'online', 'ready', 'en_service'].includes(s)) actifs += 1;
        else if (['maintenance', 'servicing'].includes(s)) maintenance += 1;
        else hors += 1;
      });
      setDronesStatus([
        { name: 'Actifs', value: actifs, color: '#10b981' },
        { name: 'Maintenance', value: maintenance, color: '#f59e0b' },
        { name: 'Hors service', value: hors, color: '#ef4444' },
      ]);
    };
    load();
  }, []);
  useEffect(() => {
    type DeliveryRow = {
      deliveryId: number;
      deliveryStatus?: string | null;
      dteValidation?: string | Date | null;
    };
    const asDate = (v?: string | Date | null): Date | null => v == null ? null : v instanceof Date ? v : new Date(v);
    const startOfDay = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };
    const dayKey = (d: Date) => startOfDay(d).toISOString();
    const frDayShort = (d: Date) =>
      d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
    const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
    const isCancelled = (s: string) =>
      ['cancelled', 'canceled', 'annulée', 'annulee', 'cancel', 'rejected', 'refused'].includes(norm(s));
    const isValidated = (s: string) =>
      ['validated', 'validée', 'validee', 'delivered', 'terminée', 'completed', 'done'].includes(norm(s));
    const timeAgo = (from: Date) => {
      const diff = Date.now() - from.getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return 'à l’instant';
      if (m < 60) return `${m} min`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h} h`;
      const d = Math.floor(h / 24);
      return `${d} j`;
    };

    const load = async () => {
      const centerId = auth.user?.role?.centerId;
      const raw = centerId != null
        ? await deliveryApi.getByCenterId(centerId)
        : await deliveryApi.getAll();

      const rows: DeliveryRow[] = raw.map((d) => ({
        deliveryId: (d as { deliveryId: number }).deliveryId,
        deliveryStatus: (d as { deliveryStatus?: string | null }).deliveryStatus ?? null,
        dteValidation: (d as { dteValidation?: string | Date | null }).dteValidation ?? null,
      }));
      const today = startOfDay(new Date());
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d;
      });
      const buckets = new Map<string, { vols: number; echecs: number; date: Date }>();
      days.forEach((d) => buckets.set(dayKey(d), { vols: 0, echecs: 0, date: d }));
      rows.forEach((r) => {
        const when = asDate(r.dteValidation);
        if (!when) return; // pas encore finalisée → on ignore
        const b = buckets.get(dayKey(when));
        if (!b) return;
        const s = norm(r.deliveryStatus);
        if (isValidated(s)) b.vols += 1;
        else if (isCancelled(s)) b.echecs += 1;
      });
      setDeliveryStats(
        days.map((d) => {
          const b = buckets.get(dayKey(d))!;
          return { name: frDayShort(d), vols: b.vols, echecs: b.echecs };
        })
      );
      const finalized = rows
        .filter((r) => asDate(r.dteValidation))
.sort((a, b) =>asDate(b.dteValidation)!.getTime() - asDate(a.dteValidation)!.getTime()).slice(0, 8)
        .map((r, idx) => {
          const s = norm(r.deliveryStatus);
          const when = asDate(r.dteValidation)!;
          return isCancelled(s)
            ? { id: idx, type: 'warning' as const, message: `Livraison #${r.deliveryId} annulée`, time: timeAgo(when) }
            : { id: idx, type: 'success' as const, message: `Livraison #${r.deliveryId} validée`, time: timeAgo(when) };
        });
      setRecentNotifications(finalized);
    };
    load();
  }, [auth.user?.role?.centerId]);
  const formatTimeAgo = (time: string) => {
    return `Il y a ${time}`;
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined sx={{ color: '#10b981' }} />;
      case 'warning':
        return <WarningAmberOutlined sx={{ color: '#f59e0b' }} />;
      default:
        return <NotificationsOutlined sx={{ color: '#3b82f6' }} />;
    }
  };
  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <WbSunnyOutlined sx={{ color: '#f59e0b', fontSize: 40 }} />;
      case 'clouds':
        return <CloudQueueOutlined sx={{ color: '#6b7280', fontSize: 40 }} />;
      case 'rain':
      case 'drizzle':
        return <OpacityOutlined sx={{ color: '#3b82f6', fontSize: 40 }} />;
      case 'thunderstorm':
        return <ThunderstormOutlined sx={{ color: '#7c3aed', fontSize: 40 }} />;
      case 'snow':
        return <AcUnitOutlined sx={{ color: '#e5e7eb', fontSize: 40 }} />;
      default:
        return <CloudOutlined sx={{ color: '#6b7280', fontSize: 40 }} />;
    }
  };
  const formatDay = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    } else {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
  };
  return (
    <Box sx={{
      backgroundColor: '#e3f8fe',
      minHeight: '100vh',
      p: { xs: 1, sm: 2, md: 3 },
      position: 'relative'
    }}>
      <Box sx={{ mb: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
            color: '#981A0E',
            fontFamily: 'Iceland, cursive',
            mb: 1
          }}
        >
          Bon retour {auth.user?.userFirstname}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontFamily: 'Share Tech, monospace',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
          }}
        >
          Tableau de bord du droniste
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, px: { xs: 1, md: 3 }, py: 1 }}>

        {/* 1ere rangé - Historique des vols et logo */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, md: 4, lg: 6 },
          width: '100%',
          justifyContent: { lg: 'space-between' },
          alignItems: { xs: 'center', lg: 'stretch' }
        }}>
          {/* Card Historique des vols - Gauche */}
          <Box sx={{
            flex: { lg: '1 1 350px' },
            maxWidth: { xs: '100%', sm: '400px', lg: '420px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                height: { xs: '250px', md: '300px' },
                width: '100%',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
              onClick={() => onNavigate('historique')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Livraisons effectués
                </Typography>
                <HistoryOutlined sx={{ color: '#008EFF' }} />
              </Box>
              <Box sx={{ height: { xs: '150px', md: '200px' }, width: '100%' }}>
                <ResponsiveContainer width="110%" height="100%" style={{ marginLeft: '-45px' }}>
                  <LineChart data={deliveryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      allowDecimals={false}
                      domain={[0, yMax]}
                      ticks={yTicks}
                    />
                    <Tooltip formatter={(v: number) => Math.round(v)} />
                    <Line type="monotone" dataKey="vols" stroke="#008EFF" strokeWidth={3} name="Livraisons terminées" />
                    <Line type="monotone" dataKey="echecs" stroke="#ef4444" strokeWidth={2} name="Livraisons annulées" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
          {/* logo */}
          <Box sx={{
            flex: { lg: '0 0 300px' },
            display: { xs: 'none', md: 'flex', lg: 'flex' },
            justifyContent: 'center',
            alignItems: 'center',
            width: { xs: '100%', lg: '300px' },
            order: { xs: -1, lg: 0 }
          }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '380px',
                width: '100%',
                position: 'relative'
              }}
            >
              {/* Ombre */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '300px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(94, 141, 156, 0.4)',
                  filter: 'blur(20px)',
                  transform: 'translateY(190px) scale(0.6)',
                  zIndex: 1,
                  transition: 'all 0.3s ease-in-out',
                }}
              />

              {/* blur*/}
              <Box
                sx={{
                  position: 'absolute',
                  width: '1000px',
                  height: '1000px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  filter: 'blur(120px)',
                  zIndex: -1,
                  transition: 'all 0.3s ease-in-out',
                }}
              />

              <Box
                component="img"
                src={droneImage}
                alt="Drone Dashboard"
                sx={{
                  maxWidth: '130%',
                  maxHeight: '600px',
                  objectFit: 'contain',
                  opacity: 0.95,
                  zIndex: 2,
                  position: 'relative',
                  transition: 'all 0.3s ease-in-out',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                }}
              />
            </Box>
          </Box>

          {/* Card Statut des drones - Droite */}
          <Box sx={{
            flex: { lg: '1 1 350px' },
            maxWidth: { xs: '100%', sm: '400px', lg: '420px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                height: { xs: '250px', md: '300px' },
                width: '100%',
                cursor: 'pointer',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
              onClick={() => onNavigate('drones')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Statut des drones
                </Typography>
                <FlightTakeoffOutlined sx={{ color: '#10b981' }} />
              </Box>
              <Box sx={{ height: { xs: '120px', md: '160px' }, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={droneStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {droneStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: { xs: 0.5, md: 1 },
                mt: { xs: 1, md: 2 }
              }}>
                {droneStatusData.map((entry) => (
                  <Chip
                    key={entry.name}
                    label={`${entry.name}: ${entry.value}`}
                    size="small"
                    sx={{
                      backgroundColor: entry.color,
                      color: 'white',
                      fontSize: { xs: '0.6rem', md: '0.7rem' },
                      fontFamily: 'Share Tech, monospace',
                      height: { xs: '20px', md: '24px' }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* 2eme rangé - Carte météo et notif */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, md: 4, lg: 6 },
          width: '100%',
          justifyContent: { lg: 'space-between' },
          alignItems: { xs: 'center', lg: 'stretch' }
        }}>

          {/* Carte météo - Gauche */}
          <Box sx={{
            flex: { lg: '1.5 1 450px' },
            maxWidth: { xs: '100%', sm: '500px', lg: '600px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                width: '100%',
                height: { xs: '320px', md: '360px' },
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)'
              }}
              onClick={() => onNavigate('meteo')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Météo - Nantes
                </Typography>
                <CloudOutlined sx={{ color: '#3b82f6' }} />
              </Box>

              {loadingWeather ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: { xs: '240px', md: '300px' }, width: '100%' }}>
                  {/* Météo actuelle */}
                  {weatherData && (
                    <Box sx={{
                      mb: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      backgroundColor: 'rgba(0, 142, 255, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 142, 255, 0.2)',
                      height: '45px'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {React.cloneElement(getWeatherIcon(weatherData.weather[0]?.main || ''), {
                          sx: { fontSize: 30, color: '#3b82f6' }
                        })}
                        <Box>
                          <Typography variant="h4" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', fontWeight: 'bold', fontSize: '1.3rem', height: '24px' }}>
                            {Math.round(weatherData.main?.temp || 0)}°C
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.8, fontSize: '0.65rem' }}>
                            Ressenti {Math.round(weatherData.main?.feels_like || 0)}°C
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.9, fontSize: '0.8rem' }}>
                          {weatherData.weather?.[0]?.description || 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
                          <AirOutlined sx={{ fontSize: 14, color: '#5C7F9B' }} />
                          <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.8, fontSize: '0.75rem' }}>
                            {(weatherData.wind?.speed || 0).toFixed(1)} m/s
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Prévisions sur 7 jours */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.9, fontSize: '0.8rem' }}>
                      Prévisions 7 jours
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: { xs: '160px', md: '210px' },
                      overflow: 'auto',
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(255,255,255,0.1)',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(92, 127, 155, 0.3)',
                        borderRadius: '2px',
                      }
                    }}>
                      {weatherForecast.map((forecast, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            backgroundColor: index === 0 ? 'rgba(0, 142, 255, 0.05)' : 'rgba(255, 255, 255, 0.3)',
                            borderRadius: 1,
                            border: index === 0 ? '1px solid rgba(0, 142, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.2)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 142, 255, 0.1)',
                              transform: 'translateX(2px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: '100px' }}>
                            {React.cloneElement(getWeatherIcon(forecast.weather[0]?.main || ''), {
                              sx: { fontSize: 28, color: '#3b82f6' }
                            })}
                            <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', fontWeight: index === 0 ? 'bold' : 'normal', fontSize: '0.8rem' }}>
                              {formatDay(forecast.dt)}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.8, fontSize: '0.75rem' }}>
                              {forecast.weather[0]?.description || 'N/A'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '80px', justifyContent: 'flex-end' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', fontWeight: 'bold', fontSize: '0.8rem' }}>
                              {Math.round(forecast.main?.temp || 0)}°C
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B', opacity: 0.6, fontSize: '0.7rem' }}>
                              {Math.round(forecast.main?.temp_min || 0)}°/{Math.round(forecast.main?.temp_max || 0)}°
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Notifications récentes - Droite */}
          <Box sx={{
            flex: { lg: '1 1 350px' },
            maxWidth: { xs: '100%', sm: '400px', lg: '450px' },
            width: { xs: '100%', lg: 'auto' }
          }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                height: { xs: 320, md: 320 },
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 16px rgba(0,0,0,0.08)',
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('notifications')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Share Tech, monospace', color: '#5C7F9B' }}>
                  Notifications récentes
                </Typography>
                <NotificationsOutlined sx={{ color: '#f59e0b' }} />
              </Box>
              <List
                dense
                sx={{
                  flex: 1,     
                  minHeight: 0,      
                  overflow: 'auto',
                  pr: 0.5,
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.1)' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(92,127,155,0.3)', borderRadius: '2px' },
                  '& .MuiListItem-root:last-of-type': { mb: 0 },
                }}
              >
                {recentNotifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    sx={{
                      borderLeft: `4px solid ${notification.type === 'success' ? '#10b981' :
                          notification.type === 'warning' ? '#f59e0b' : '#3b82f6'
                        }`,
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      borderRadius: 1,
                      mb: 1,
                      py: 1,
                    }}
                  >
                    <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontFamily: 'Share Tech, monospace', fontSize: { xs: '0.75rem', md: '0.9rem' }, color: '#5C7F9B', lineHeight: 1.2 }}>
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ fontFamily: 'Share Tech, monospace', fontSize: { xs: '0.6rem', md: '0.7rem' }, color: '#5C7F9B', opacity: 0.7 }}>
                          {formatTimeAgo(notification.time)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DronistDashboardContent;