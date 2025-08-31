import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { format } from 'date-fns';

import { getForecastByDate } from '../api/weather';
import type { ForecastEntry } from '@/types/weather';
import type { DeliveryStatus } from '@/types/delivery';

type Coordinates = { lat: number; lon: number };

interface EditStatusPopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (status: DeliveryStatus, newDate?: Date) => void;
  onUpdate?: () => void;
  currentStatus: DeliveryStatus;
  currentDate?: Date;
  coordinates?: Coordinates;
}

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pending: 'Programmer',
  in_transit: 'En transit',
  charged: 'Chargée',
  delivered: 'Livré',
  cancelled: 'Annuler',
};

const ALL_STATUSES: DeliveryStatus[] = ['pending', 'in_transit','charged', 'delivered', 'cancelled'];

const EditStatusDeliveryPopup: React.FC<EditStatusPopupProps> = ({
  open,
  onClose,
  onSave,
  onUpdate,
  currentStatus,
  currentDate,
  coordinates
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [status, setStatus] = useState<DeliveryStatus>(currentStatus);
  const [newDate, setNewDate] = useState<string>(
    currentStatus === 'pending' && currentDate ? format(currentDate, 'yyyy-MM-dd') : ''
  );
  const [forecastData, setForecastData] = useState<ForecastEntry[]>([]);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    setStatus(currentStatus);

    if (currentStatus === 'pending' && currentDate) {
      setNewDate(format(currentDate, 'yyyy-MM-dd'));
    } else if (currentStatus === 'cancelled') {
      setNewDate(format(new Date(), 'yyyy-MM-dd')); // aujourd'hui
    } else {
      setNewDate('');
    }
  }, [open, currentStatus, currentDate]);

  const isDateRequired = status === 'pending';
  const isSaveDisabled = isDateRequired && !newDate;

useEffect(() => {
  const fetchWeather = async () => {
    if (!coordinates) {
      setForecastData([]);
      return;
    }

    const dateToUse =
      status === 'pending' && !!newDate
        ? new Date(newDate)
        : (() => {
            const d = new Date();
            if (d.getHours() >= 21) d.setDate(d.getDate() + 1);
            return d;
          })();

    setLoadingWeather(true);
    try {
      const list = await getForecastByDate(coordinates.lat, coordinates.lon, dateToUse);
      setForecastData(list);
    } catch (err) {
      console.error('Erreur chargement météo:', err);
      setForecastData([]);
    } finally {
      setLoadingWeather(false);
    }
  };

  if (open) void fetchWeather();
}, [open, status, newDate, coordinates?.lat, coordinates?.lon]);

  const handleSave = async () => {
    let dateToSend: Date | undefined = undefined;

    if (status === 'pending' && newDate) {
      dateToSend = new Date(newDate);
    } else if (status === 'cancelled') {
      dateToSend = new Date();
    }

    await onSave(status, dateToSend);
    if (onUpdate) await onUpdate();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <DialogTitle sx={{ fontFamily: 'Share Tech, monospace' }}>
        Modifier le statut de la livraison
      </DialogTitle>

      <DialogContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <Stack spacing={3} flex={0.6}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel
                id="statut-label"
                sx={{ fontFamily: 'Share Tech, monospace', paddingTop: '8px' }}
                shrink
              >
                Statut
              </InputLabel>
              <Select
                labelId="statut-label"
                value={status}
                label="Statut"
                onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
                sx={{ fontFamily: 'Share Tech, monospace', marginTop: '4px' }}
              >
                {ALL_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isDateRequired && (
              <TextField
                type="date"
                label="Date de livraison"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ fontFamily: 'Share Tech, monospace' }}
              />
            )}
          </Stack>

          <Stack spacing={2} flex={1}>
            {loadingWeather ? (
              <Typography sx={{ fontFamily: 'Share Tech, monospace' }}>
                Chargement...
              </Typography>
            ) : forecastData.length > 0 ? (
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'Share Tech, monospace' }}>Heure</TableCell>
                      <TableCell sx={{ fontFamily: 'Share Tech, monospace' }}>Icône</TableCell>
                      <TableCell sx={{ fontFamily: 'Share Tech, monospace' }}>Vent (m/s)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {forecastData
                      .filter((entry) => {
                        const hour = parseInt(entry.dt_txt.split(' ')[1].slice(0, 2), 10);
                        return hour;
                      })
                      .map((entry) => (
                        <TableRow key={entry.dt_txt}>
                          <TableCell sx={{ fontFamily: 'Share Tech, monospace' }}>
                            {entry.dt_txt.split(' ')[1].slice(0, 5)}
                          </TableCell>
                          <TableCell>
                            {entry.weather?.[0]?.icon && (
                              <img
                                src={`https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`}
                                alt="météo"
                                style={{ width: 48, height: 48 }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Share Tech, monospace' }}>
                            {entry.wind?.speed ?? '?'} m/s
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" sx={{ fontFamily: 'Share Tech, monospace' }}>
                Météo non disponible
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ fontFamily: 'Share Tech, monospace' }}>
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ fontFamily: 'Share Tech, monospace' }}
          disabled={isSaveDisabled}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStatusDeliveryPopup;
