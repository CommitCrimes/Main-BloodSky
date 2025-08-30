import React, { useState, useEffect } from 'react';

const commonStyles = {
  gradientText: {
    background: 'linear-gradient(45deg, #981A0E, #C41E3A)',
    backgroundClip: 'text' as const,
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
  },
};
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Checkbox,
  FormControlLabel,
  AlertTitle
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Refresh,
  BusinessCenter,
  Visibility
} from '@mui/icons-material';
import { api } from '../api/api';

interface Center {
  centerId: number;
  centerCity: string;
  centerPostal: number;
  centerAdress: string;
  centerLatitude?: string;
  centerLongitude?: string;
}

interface DeleteErrorData {
  canForce?: boolean;
  deliveries?: number;
  drones?: number;
  message?: string;
  relatedCount?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const SuperAdminCenterManagement: React.FC = () => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | 'view'>('edit');
  const [tabValue, setTabValue] = useState(0);
  
  // Form states
  const [formData, setFormData] = useState({
    centerCity: '',
    centerAdress: '',
    centerPostal: '',
    centerLatitude: '',
    centerLongitude: '',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<{canForce?: boolean; relatedCount?: number; message?: string; deliveries?: number; drones?: number} | null>(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/centers');
      const centersData = Array.isArray(response.data) ? response.data : [];
      setCenters(centersData);
    } catch (err) {
      console.error('Erreur lors du chargement des centres:', err);
      setError('Impossible de charger la liste des centres de don');
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type: 'edit' | 'delete' | 'view', center?: Center) => {
    setDialogType(type);
    setSelectedCenter(center || null);
    if (center && type === 'edit') {
      setFormData({
        centerCity: center.centerCity || '',
        centerAdress: center.centerAdress || '',
        centerPostal: center.centerPostal?.toString() || '',
        centerLatitude: center.centerLatitude || '',
        centerLongitude: center.centerLongitude || '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCenter(null);
    setFormData({
      centerCity: '',
      centerAdress: '',
      centerPostal: '',
      centerLatitude: '',
      centerLongitude: '',
    });
    setFormErrors({});
    setForceDelete(false);
    setDeleteWarning(null);
    setError(null);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.centerCity.trim()) {
      errors.centerCity = 'Le nom du centre est requis';
    }
    if (!formData.centerAdress.trim()) {
      errors.centerAdress = 'L\'adresse est requise';
    }
    if (!formData.centerPostal.trim()) {
      errors.centerPostal = 'Le code postal est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        center_city: formData.centerCity,
        center_adress: formData.centerAdress,
        center_postal: formData.centerPostal ? parseInt(formData.centerPostal) : null,
        center_latitude: formData.centerLatitude || null,
        center_longitude: formData.centerLongitude || null,
      };

      if (dialogType === 'edit' && selectedCenter) {
        await api.put(`/superadmin/centers/${selectedCenter.centerId}`, payload);
      } else {
        await api.post('/superadmin/centers', payload);
      }

      await fetchCenters();
      handleCloseDialog();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde du centre');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCenter = async () => {
    if (!selectedCenter) return;

    try {
      setSubmitting(true);
      const url = forceDelete 
        ? `/superadmin/centers/${selectedCenter.centerId}?force=true`
        : `/superadmin/centers/${selectedCenter.centerId}`;
      
      await api.delete(url);
      await fetchCenters();
      handleCloseDialog();
      setError(null);
    } catch (err: unknown) {
      console.error('Erreur lors de la suppression:', err);
      const errorData = (err as { response?: { data?: DeleteErrorData } }).response?.data;
      
      if (errorData?.canForce && !forceDelete) {
        setDeleteWarning({
          canForce: true,
          relatedCount: errorData.relatedCount,
          message: errorData.message,
          deliveries: errorData.deliveries,
          drones: errorData.drones
        });
      } else {
        setError(errorData?.message || 'Erreur lors de la suppression du centre');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des centres...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Button onClick={fetchCenters} sx={{ ml: 2 }}>
          Réessayer
        </Button>
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{
          fontSize: { xs: '1.8rem', sm: '2.2rem' },
          mb: 0.5,
          fontFamily: 'Iceland, cursive',
          ...commonStyles.gradientText,
          textAlign: { xs: 'center', sm: 'left' }
        }}
      >
        Gestion des Centres de Don
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Liste des Centres" />
          <Tab label="Ajouter un Centre" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Statistiques */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Centres
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {centers?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Nantes
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {centers?.filter(c => c.centerCity === 'Nantes')?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Autres Villes
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {centers?.filter(c => c.centerCity !== 'Nantes')?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" component="h2">
                Liste des Centres de Don
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchCenters}
              >
                Actualiser
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Adresse</TableCell>
                    <TableCell>Code Postal</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(centers || []).map((center) => (
                    <TableRow key={center.centerId}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <BusinessCenter sx={{ mr: 1 }} />
                          {center.centerCity}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {center.centerAdress}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {center.centerPostal}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('view', center)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('edit', center)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('delete', center)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Ajouter un Nouveau Centre de Don
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Ville *"
                  value={formData.centerCity}
                  onChange={(e) => setFormData({ ...formData, centerCity: e.target.value })}
                  error={!!formErrors.centerCity}
                  helperText={formErrors.centerCity}
                />
                <TextField
                  fullWidth
                  label="Code postal *"
                  value={formData.centerPostal}
                  onChange={(e) => setFormData({ ...formData, centerPostal: e.target.value })}
                  error={!!formErrors.centerPostal}
                  helperText={formErrors.centerPostal}
                />
              </Box>
              <TextField
                fullWidth
                label="Adresse *"
                value={formData.centerAdress}
                onChange={(e) => setFormData({ ...formData, centerAdress: e.target.value })}
                error={!!formErrors.centerAdress}
                helperText={formErrors.centerAdress}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={formData.centerLatitude}
                  onChange={(e) => setFormData({ ...formData, centerLatitude: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.centerLongitude}
                  onChange={(e) => setFormData({ ...formData, centerLongitude: e.target.value })}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleSubmitForm}
                disabled={submitting}
              >
                {submitting ? 'Ajout en cours...' : 'Ajouter le Centre'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setFormData({
                    centerCity: '',
                    centerAdress: '',
                    centerPostal: '',
                    centerLatitude: '',
                    centerLongitude: '',
                  });
                  setFormErrors({});
                }}
              >
                Réinitialiser
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Dialog pour view/edit/delete */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'view' && 'Détails du Centre'}
          {dialogType === 'edit' && 'Modifier le Centre'}
          {dialogType === 'delete' && 'Supprimer le Centre'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <Box>
              <Typography>
                Êtes-vous sûr de vouloir supprimer le centre de "{selectedCenter?.centerCity}" ?
              </Typography>
              
              {deleteWarning && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <AlertTitle>Attention</AlertTitle>
                  {deleteWarning.message}
                  
                  {deleteWarning.canForce && (
                    <Box sx={{ mt: 1 }}>
                      {(deleteWarning.deliveries || 0) > 0 && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          • {deleteWarning.deliveries} livraison(s) seront dissociées
                        </Typography>
                      )}
                      {(deleteWarning.drones || 0) > 0 && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • {deleteWarning.drones} drone(s) seront dissociés
                        </Typography>
                      )}
                      
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={forceDelete}
                            onChange={(e) => setForceDelete(e.target.checked)}
                            color="warning"
                          />
                        }
                        label="Je comprends les conséquences et souhaite forcer la suppression (les données associées seront dissociées)"
                      />
                    </Box>
                  )}
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          ) : dialogType === 'view' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Ville</Typography>
                  <Typography variant="body1">{selectedCenter?.centerCity}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Code Postal</Typography>
                  <Typography variant="body1">{selectedCenter?.centerPostal}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Adresse</Typography>
                <Typography variant="body1">{selectedCenter?.centerAdress}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Latitude</Typography>
                  <Typography variant="body1">{selectedCenter?.centerLatitude || 'Non spécifiée'}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Longitude</Typography>
                  <Typography variant="body1">{selectedCenter?.centerLongitude || 'Non spécifiée'}</Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Ville *"
                  value={formData.centerCity}
                  onChange={(e) => setFormData({ ...formData, centerCity: e.target.value })}
                  error={!!formErrors.centerCity}
                  helperText={formErrors.centerCity}
                />
                <TextField
                  fullWidth
                  label="Code postal *"
                  value={formData.centerPostal}
                  onChange={(e) => setFormData({ ...formData, centerPostal: e.target.value })}
                  error={!!formErrors.centerPostal}
                  helperText={formErrors.centerPostal}
                />
              </Box>
              <TextField
                fullWidth
                label="Adresse *"
                value={formData.centerAdress}
                onChange={(e) => setFormData({ ...formData, centerAdress: e.target.value })}
                error={!!formErrors.centerAdress}
                helperText={formErrors.centerAdress}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={formData.centerLatitude}
                  onChange={(e) => setFormData({ ...formData, centerLatitude: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.centerLongitude}
                  onChange={(e) => setFormData({ ...formData, centerLongitude: e.target.value })}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogType === 'view' ? 'Fermer' : 'Annuler'}
          </Button>
          {dialogType === 'delete' && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleDeleteCenter}
              disabled={submitting}
            >
              {submitting ? 'Suppression...' : 'Supprimer'}
            </Button>
          )}
          {dialogType === 'edit' && (
            <Button 
              variant="contained" 
              onClick={handleSubmitForm}
              disabled={submitting}
            >
              {submitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminCenterManagement;