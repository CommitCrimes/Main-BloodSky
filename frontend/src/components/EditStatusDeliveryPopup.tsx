import React, { useState, useEffect } from 'react';
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

interface EditStatusPopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (status: string, newDate?: Date) => void;
  onUpdate?: () => void;
  currentStatus: string;
  currentDate?: Date;
  coordinates?: { lat: number; lon: number };
}

const EditStatusDeliveryPopup: React.FC<EditStatusPopupProps> = ({
  open,
  onClose,
  onSave,
  onUpdate,
  currentStatus,
  currentDate,
  coordinates
}) => {
  const [status, setStatus] = useState(currentStatus === 'pending' ? 'pending' : 'cancelled');
  const [newDate, setNewDate] = useState(currentDate ? format(currentDate, 'yyyy-MM-dd') : '');
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const isDateRequired = status === 'pending';
  const isSaveDisabled = isDateRequired && !newDate;

  useEffect(() => {
    const fetchWeather = async () => {
      if (!coordinates) return;
      setLoadingWeather(true);

      try {
        if (status === 'pending' && newDate) {
          const forecastList = await getForecastByDate(
            coordinates.lat,
            coordinates.lon,
            new Date(newDate)
          );
          setForecastData(forecastList);
        } else if (status === 'cancelled' && currentDate) {
          const forecastList = await getForecastByDate(
            coordinates.lat,
            coordinates.lon,
            currentDate
          );
          setForecastData(forecastList);
        } else {
          setForecastData([]);
        }
      } catch (err) {
        console.error('Erreur chargement météo:', err);
        setForecastData([]);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [status, newDate, coordinates]);

  const handleSave = async () => {
    const dateToSend =
      status === 'pending' && newDate
        ? new Date(newDate)
        : undefined;

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
    sx={{
      fontFamily: 'Share Tech, monospace',
      paddingTop: '8px' // Ajoutez du padding au label
    }}
    shrink
  >
    Statut
  </InputLabel>
  <Select
    labelId="statut-label"
    value={status}
    label="Statut"
    onChange={(e) => setStatus(e.target.value)}
    sx={{
      fontFamily: 'Share Tech, monospace',
      marginTop: '4px'
    }}
  >
    <MenuItem value="cancelled">Annuler</MenuItem>
    <MenuItem value="pending">Programmer</MenuItem>
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
              <Typography sx={{ fontFamily: 'Share Tech, monospace' }}>Chargement...</Typography>
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
                        return hour >= 9 && hour <= 18;
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
