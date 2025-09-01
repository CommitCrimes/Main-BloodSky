import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Paper, Box, Typography, Chip, CircularProgress, Alert,
  Checkbox, FormControlLabel
} from '@mui/material';
import { PriorityHigh, CheckCircle, DirectionsCar, Pending, Cancel, Inventory2  } from '@mui/icons-material';

import { deliveryApi } from '@/api/delivery';
import { donationCenterApi } from '@/api/donation_center';
import { hospitalApi } from '@/api/hospital';
import { dronesApi } from '@/api/drone';

import type { DeliveryWithParticipants, DeliveryStatus } from '@/types/delivery';
import type { DonationCenter } from '@/types/order';
import type { DroneMission } from '@/types/drone';

// ----------------- Props -----------------
type Props = {
  open: boolean;
  onClose: () => void;
  centerId?: number | null;
  droneId: number;
  statusFilter?: DeliveryStatus[];
  onAssigned?: (deliveryId: number) => void;
  onMissionReady?: (payload: { deliveryId: number; filename: string; hospitalId: number; lat: number; lon: number }) => void;
  defaultAltitude?: number;
};


// ----------------- Helpers -----------------
const parseDate = (s?: string | null) => (s ? new Date(s) : null);
const toDay = (d: Date | null) => (d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null);

type UrgentShape = { isUrgent?: boolean; deliveryUrgent?: boolean };
const isUrgentFlag = (x: UrgentShape) => x.isUrgent === true || x.deliveryUrgent === true;

const formatFrDay = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Date non définie';

const compareByPlannedDateThenUrgency = (a: DeliveryWithParticipants, b: DeliveryWithParticipants) => {
  const da = toDay(parseDate(a.dteValidation ?? null));
  const db = toDay(parseDate(b.dteValidation ?? null));
  if (da && db) {
    const diff = da.getTime() - db.getTime();
    if (diff !== 0) return diff;
  } else if (da && !db) return -1;
  else if (!da && db) return 1;

  const au = isUrgentFlag(a);
  const bu = isUrgentFlag(b);
  if (au !== bu) return bu ? 1 : -1;

  return a.deliveryId - b.deliveryId;
};

const getStatusColor = (status: DeliveryStatus) => {
  switch (status) {
    case 'delivered':  return '#10b981';
    case 'in_transit': return '#f59e0b';
    case 'charged': return '#3b82f6';
    case 'pending':    return '#6b7280';
    case 'cancelled':  return '#ef4444';
    default:           return '#6b7280';
  }
};
const getStatusLabel = (status: DeliveryStatus) => {
  switch (status) {
    case 'delivered':  return 'Livrée';
    case 'in_transit': return 'En transit';
    case 'charged': return 'Chargée';
    case 'pending':    return 'En attente';
    case 'cancelled':  return 'Annulé';
    default:           return 'Inconnu';
  }
};
const getStatusIcon = (status: DeliveryStatus) => {
  switch (status) {
    case 'delivered':  return <CheckCircle />;
    case 'in_transit': return <DirectionsCar />;
    case 'charged':    return <Inventory2 />;   
    case 'pending':    return <Pending />;
    case 'cancelled':  return <Cancel />;
    default:           return <Pending />;
  }
};

type HospitalLite = {
  hospitalId: number;
  hospitalName?: string | null;
  hospitalLatitude?: string | null;
  hospitalLongitude?: string | null;
};

const toNum = (s?: string | null) => Number(String(s ?? '').trim().replace(',', '.'));

// ----------------- Component -----------------
const AssignDeliveryDialog: React.FC<Props> = ({
  open, onClose, centerId, droneId, statusFilter = ['pending', 'charged'], onAssigned, onMissionReady,defaultAltitude = 50
}) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  // Données
  const [all, setAll] = useState<DeliveryWithParticipants[]>([]);
  const [includeUnassigned, setIncludeUnassigned] = useState(false);
  // spinner par ligne
  const [sendingId, setSendingId] = useState<number | null>(null);
  // Caches libellés
  const [centerMap, setCenterMap] = useState<Record<number, string>>({});
  const [hospitalMap, setHospitalMap] = useState<Record<number, string>>({});
  const resolveLabels = async (list: DeliveryWithParticipants[]) => {
    const missingCenterIds = Array.from(
      new Set(list.map(d => d.centerId).filter((id): id is number => id != null && !(id in centerMap)))
    );
    const missingHospitalIds = Array.from(
      new Set(list.map(d => d.hospitalId).filter((id): id is number => id != null && !(id in hospitalMap)))
    );

    if (missingCenterIds.length === 0 && missingHospitalIds.length === 0) return;

    try {
      const [centers, hospitals] = await Promise.all([
        Promise.all(missingCenterIds.map(async (id) => {
          const c = await donationCenterApi.getCenterById(id);
          return { id, city: (c as unknown as DonationCenter).centerCity };
        })),
        Promise.all(missingHospitalIds.map(async (id) => {
          const h = await hospitalApi.getById(id) as HospitalLite;
          return { id, name: h?.hospitalName ?? null };
        }))
      ]);

      if (centers.length) {
        setCenterMap(prev => {
          const next = { ...prev };
          centers.forEach(c => { if (c.city) next[c.id] = c.city!; });
          return next;
        });
      }
      if (hospitals.length) {
        setHospitalMap(prev => {
          const next = { ...prev };
          hospitals.forEach(h => { if (h.name) next[h.id] = h.name!; });
          return next;
        });
      }
    } catch (e) {
      console.warn('resolveLabels error:', e);
    }
  };

  const load = async () => {
    if (!centerId) {
      setAll([]);
      setError('Centre de don inconnu.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApi.getByCenterId(centerId);
      setAll(data);
      await resolveLabels(data);
    } catch (e) {
      console.error(e);
      setError('Impossible de charger les livraisons.');
      setAll([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) { void load(); } }, [open, centerId]);

const items = useMemo(() => {
  return all
    .filter(d => statusFilter.includes(d.deliveryStatus))
    .filter(d => includeUnassigned ? (d.droneId === droneId || d.droneId == null) : d.droneId === droneId)
    .slice()
    .sort(compareByPlannedDateThenUrgency);
}, [all, statusFilter, includeUnassigned, droneId]);

const handleLoadMission = async (d: DeliveryWithParticipants) => {
  try {
    setSendingId(d.deliveryId);

    if (d.droneId !== droneId) {
      await deliveryApi.update(d.deliveryId, { droneId } as unknown as { droneId: number });
      setAll((prev: DeliveryWithParticipants[]) =>
        prev.map(x => (x.deliveryId === d.deliveryId ? { ...x, droneId } : x))
      );
      onAssigned?.(d.deliveryId);
    }

    if (!d.hospitalId) throw new Error('Hôpital manquant pour cette livraison');
    const h = (await hospitalApi.getById(d.hospitalId)) as HospitalLite;
    const lat = toNum(h?.hospitalLatitude);
    const lon = toNum(h?.hospitalLongitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error('Coordonnées hôpital invalides');
    }

    const ALT = defaultAltitude ?? 50;
    const filename = `DEFAULT_Delivery_DroneID_${droneId}_HopitalID:${d.hospitalId}.waypoints`;

    const fi = await dronesApi.getFlightInfo(droneId).catch(() => null);

    const mission: DroneMission = {
      filename,
      altitude_takeoff: ALT,
      mode: 'auto',
      waypoints: [{ lat, lon, alt: ALT }],
      ...(fi
        ? { startlat: Number(fi.latitude), startlon: Number(fi.longitude), startalt: ALT }
        : {}),
    };

    const res = await dronesApi.createMission(droneId, mission);
    await dronesApi.sendMissionFile(droneId, res.filename);

    onMissionReady?.({
      deliveryId: d.deliveryId,
      filename: res.filename,
      hospitalId: d.hospitalId,
      lat,
      lon,
    });
  } catch (e) {
    console.error(e);
    setError('Échec de la création/envoi de mission.');
  } finally {
    setSendingId(null);
  }
};
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Livraisons en attente</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Affichage : livraisons assignées au drone #{droneId}
            {includeUnassigned ? ' + non-assignées' : ''}
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeUnassigned}
                onChange={(e) => setIncludeUnassigned(e.target.checked)}
              />
            }
            label="Non-assigné"
          />
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Chargement…</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : items.length === 0 ? (
          <Typography>Aucune livraison correspondant au filtre.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map(d => {
              const centerCity   = centerMap[d.centerId] ?? `Centre #${d.centerId}`;
              const hospitalName = hospitalMap[d.hospitalId] ?? `Hôpital #${d.hospitalId}`;
              const urgent       = isUrgentFlag(d);
              const dateLabel    = formatFrDay(d.dteValidation ?? null);
              const isUnassigned = d.droneId == null;
              const busy         = sendingId === d.deliveryId;

              return (
                <Paper
                  key={d.deliveryId}
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    ...(isUnassigned && {
                      bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : t.palette.grey[200],
                      border: '1px solid',
                      borderColor: (t) => t.palette.mode === 'dark' ? t.palette.grey[700] : t.palette.grey[300],
                    }),
                    ...(urgent && {
                      borderLeft: '6px solid #d32f2f',
                      boxShadow: '0 0 0 2px rgba(211,47,47,0.15) inset',
                    }),
                  }}
                >
                  {urgent && (
                    <Chip
                      icon={<PriorityHigh />}
                      label="URGENT"
                      color="error"
                      size="small"
                      sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 'bold', letterSpacing: 1 }}
                    />
                  )}

                  <Box sx={isUnassigned ? { color: 'text.secondary' } : undefined}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Livraison #{d.deliveryId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {centerCity} → {hospitalName}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Date prévue : {dateLabel}
                    </Typography>

                    <Chip
                      icon={getStatusIcon(d.deliveryStatus)}
                      label={getStatusLabel(d.deliveryStatus)}
                      sx={{
                        mt: 1,
                        backgroundColor: getStatusColor(d.deliveryStatus),
                        color: 'white',
                        fontFamily: 'Share Tech, monospace'
                      }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    disabled={busy}
                    onClick={() => handleLoadMission(d)}
                  >
                    {busy ? (<><CircularProgress size={18} sx={{ mr: 1 }} /> Envoi…</>) : 'Creer Mission'}
                  </Button>
                </Paper>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        <Button onClick={load}>Rafraîchir</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignDeliveryDialog;
