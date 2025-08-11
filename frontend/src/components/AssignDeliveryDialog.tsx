import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Paper, Box, Typography, Chip, CircularProgress, Alert,
  Checkbox, FormControlLabel
} from '@mui/material';
import { PriorityHigh } from '@mui/icons-material';

import { deliveryApi } from '@/api/delivery';
import { donationCenterApi } from '@/api/donation_center';
import { hospitalApi } from '@/api/hospital';

import type { DeliveryWithParticipants, DeliveryStatus } from '@/types/delivery';
import type { DonationCenter } from '@/types/order';

type Props = {
  open: boolean;
  onClose: () => void;
  centerId?: number | null;
  droneId: number;
  statusFilter?: DeliveryStatus;          // défaut: 'pending'
  onAssigned?: (deliveryId: number) => void;
};

type HospitalLite = { hospitalId: number; hospitalName: string | null };

// Helpers
const parseDate = (s?: string | null) => (s ? new Date(s) : null);
const toDay = (d: Date | null) => (d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null);
type UrgentShape = { isUrgent?: boolean; deliveryUrgent?: boolean };
const isUrgentFlag = (x: UrgentShape) =>
  x.isUrgent === true || x.deliveryUrgent === true;

const formatFrDay = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Date non définie';

const compareByPlannedDateThenUrgency = (a: DeliveryWithParticipants, b: DeliveryWithParticipants) => {
  const da = toDay(parseDate(a.dteValidation ?? null));
  const db = toDay(parseDate(b.dteValidation ?? null));
  if (da && db) {
    const diff = da.getTime() - db.getTime();
    if (diff !== 0) return diff; // plus tôt en premier
  } else if (da && !db) return -1;
  else if (!da && db) return 1;

  const au = isUrgentFlag(a);
  const bu = isUrgentFlag(b);
  if (au !== bu) return bu ? 1 : -1;

  return a.deliveryId - b.deliveryId;
};

const AssignDeliveryDialog: React.FC<Props> = ({
  open, onClose, centerId, droneId, statusFilter = 'pending', onAssigned
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tableau maître chargé une fois
  const [all, setAll] = useState<DeliveryWithParticipants[]>([]);
  const [includeUnassigned, setIncludeUnassigned] = useState(false);

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
          centers.forEach(c => { if (c.city) next[c.id] = c.city; });
          return next;
        });
      }
      if (hospitals.length) {
        setHospitalMap(prev => {
          const next = { ...prev };
          hospitals.forEach(h => { if (h.name) next[h.id] = h.name; });
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

  // Filtrage
  const items = useMemo(() => {
    const filtered = all
      .filter(d => d.deliveryStatus === statusFilter)
      .filter(d => includeUnassigned ? (d.droneId === droneId || d.droneId == null) : d.droneId === droneId)
      .slice()
      .sort(compareByPlannedDateThenUrgency);
    return filtered;
  }, [all, statusFilter, includeUnassigned, droneId]);

  const handleAssign = async (deliveryId: number) => {
    try {
      await deliveryApi.update(deliveryId, { droneId } as unknown as { droneId: number });
      setAll(prev => prev.map(d => d.deliveryId === deliveryId ? { ...d, droneId } : d));
      onAssigned?.(deliveryId);
    } catch (e) {
      console.error(e);
      setError('Échec de l’assignation du drone.');
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
              const centerCity = centerMap[d.centerId] ?? `Centre #${d.centerId}`;
              const hospitalName = hospitalMap[d.hospitalId] ?? `Hôpital #${d.hospitalId}`;
              const urgent = isUrgentFlag(d) && d.isUrgent;
              const dateLabel = formatFrDay(d.dteValidation ?? null);
              const isUnassigned = d.droneId == null;

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
                      bgcolor: (t) =>
                        t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : t.palette.grey[200],
                      border: '1px solid',
                      borderColor: (t) =>
                        t.palette.mode === 'dark' ? t.palette.grey[700] : t.palette.grey[300],
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

                  {/* ✅ texte un peu atténué si non assigné */}
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
                      size="small"
                      label={d.deliveryStatus}
                      color={d.deliveryStatus === 'pending' ? 'warning' : 'default'}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Button variant="contained" onClick={() => handleAssign(d.deliveryId)}>
                    Assigner à ce drone
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
