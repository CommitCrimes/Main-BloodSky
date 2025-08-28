import React, { useState, useEffect } from 'react';
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
  LocalHospital,
  Visibility
} from '@mui/icons-material';
import { api } from '../api/api';

interface Hospital {
  hospitalId: number;
  hospitalName: string;
  hospitalCity: string;
  hospitalPostal: number;
  hospitalAdress: string;
  hospitalLatitude?: string;
  hospitalLongitude?: string;
  hospitalStatus?: string;
  hospitalCapacity?: number;
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

const SuperAdminHospitalManagement: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | 'view'>('edit');
  const [tabValue, setTabValue] = useState(0);
  
  // Form states
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalCity: '',
    hospitalPostal: '',
    hospitalAdress: '',
    hospitalLatitude: '',
    hospitalLongitude: '',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<{canForce?: boolean; relatedCount?: number; message?: string} | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/hospitals');
      const hospitalsData = Array.isArray(response.data) ? response.data : [];
      setHospitals(hospitalsData);
    } catch (err) {
      console.error('Erreur lors du chargement des hôpitaux:', err);
      setError('Impossible de charger la liste des hôpitaux');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type: 'edit' | 'delete' | 'view', hospital?: Hospital) => {
    setDialogType(type);
    setSelectedHospital(hospital || null);
    if (hospital && type === 'edit') {
      setFormData({
        hospitalName: hospital.hospitalName || '',
        hospitalCity: hospital.hospitalCity || '',
        hospitalPostal: hospital.hospitalPostal?.toString() || '',
        hospitalAdress: hospital.hospitalAdress || '',
        hospitalLatitude: hospital.hospitalLatitude || '',
        hospitalLongitude: hospital.hospitalLongitude || '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHospital(null);
    setFormData({
      hospitalName: '',
      hospitalCity: '',
      hospitalPostal: '',
      hospitalAdress: '',
      hospitalLatitude: '',
      hospitalLongitude: '',
    });
    setFormErrors({});
    setForceDelete(false);
    setDeleteWarning(null);
    setError(null);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.hospitalName.trim()) {
      errors.hospitalName = 'Le nom de l\'hôpital est requis';
    }
    if (!formData.hospitalAdress.trim()) {
      errors.hospitalAdress = 'L\'adresse est requise';
    }
    if (!formData.hospitalCity.trim()) {
      errors.hospitalCity = 'La ville est requise';
    }
    if (!formData.hospitalPostal.trim()) {
      errors.hospitalPostal = 'Le code postal est requis';
    }
    if (!formData.hospitalLatitude.trim()) {
      errors.hospitalLatitude = 'La latitude est requise';
    }
    if (!formData.hospitalLongitude.trim()) {
      errors.hospitalLongitude = 'La longitude est requise';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        hospital_name: formData.hospitalName,
        hospital_city: formData.hospitalCity,
        hospital_postal: formData.hospitalPostal ? parseInt(formData.hospitalPostal) : null,
        hospital_adress: formData.hospitalAdress,
        hospital_latitude: formData.hospitalLatitude || null,
        hospital_longitude: formData.hospitalLongitude || null,
      };

      if (dialogType === 'edit' && selectedHospital) {
        await api.put(`/superadmin/hospitals/${selectedHospital.hospitalId}`, payload);
      } else {
        await api.post('/superadmin/hospitals', payload);
      }

      await fetchHospitals();
      handleCloseDialog();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde de l\'hôpital');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHospital = async () => {
    if (!selectedHospital) return;

    try {
      setSubmitting(true);
      const url = forceDelete 
        ? `/superadmin/hospitals/${selectedHospital.hospitalId}?force=true`
        : `/superadmin/hospitals/${selectedHospital.hospitalId}`;
      
      await api.delete(url);
      await fetchHospitals();
      handleCloseDialog();
      setError(null);
    } catch (err: unknown) {
      console.error('Erreur lors de la suppression:', err);
      const errorData = (err as { response?: { data?: { canForce?: boolean; relatedCount?: number; message?: string; relatedData?: { deliveries?: number; notifications?: number } } } }).response?.data;
      
      if (errorData?.canForce && !forceDelete) {
        setDeleteWarning({
          canForce: true,
          relatedCount: errorData.relatedCount,
          message: errorData.message
        });
      } else {
        setError(errorData?.message || 'Erreur lors de la suppression de l\'hôpital');
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
          Chargement des hôpitaux...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Button onClick={fetchHospitals} sx={{ ml: 2 }}>
          Réessayer
        </Button>
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des Hôpitaux
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Liste des Hôpitaux" />
          <Tab label="Ajouter un Hôpital" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Statistiques */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Hôpitaux
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {hospitals?.length || 0}
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
                  {hospitals?.filter(h => h.hospitalCity === 'Nantes')?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  En Maintenance
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {hospitals?.filter(h => h.hospitalStatus === 'maintenance')?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Capacité Totale
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {hospitals?.reduce((sum, h) => sum + (h.hospitalCapacity || 0), 0) || 0}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" component="h2">
                Liste des Hôpitaux
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchHospitals}
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
                    <TableCell>Ville</TableCell>
                    <TableCell>Code Postal</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(hospitals || []).map((hospital) => (
                    <TableRow key={hospital.hospitalId}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <LocalHospital sx={{ mr: 1 }} />
                          {hospital.hospitalName}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {hospital.hospitalAdress}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {hospital.hospitalCity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {hospital.hospitalPostal}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('view', hospital)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('edit', hospital)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('delete', hospital)}
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
              Ajouter un Nouvel Hôpital
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Nom de l'hôpital *"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                error={!!formErrors.hospitalName}
                helperText={formErrors.hospitalName}
              />
              <TextField
                fullWidth
                label="Adresse *"
                value={formData.hospitalAdress}
                onChange={(e) => setFormData({ ...formData, hospitalAdress: e.target.value })}
                error={!!formErrors.hospitalAdress}
                helperText={formErrors.hospitalAdress}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Ville *"
                  value={formData.hospitalCity}
                  onChange={(e) => setFormData({ ...formData, hospitalCity: e.target.value })}
                  error={!!formErrors.hospitalCity}
                  helperText={formErrors.hospitalCity}
                />
                <TextField
                  fullWidth
                  label="Code postal *"
                  value={formData.hospitalPostal}
                  onChange={(e) => setFormData({ ...formData, hospitalPostal: e.target.value })}
                  error={!!formErrors.hospitalPostal}
                  helperText={formErrors.hospitalPostal}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Latitude *"
                  value={formData.hospitalLatitude}
                  onChange={(e) => setFormData({ ...formData, hospitalLatitude: e.target.value })}
                  placeholder="Ex: 47.21806"
                  error={!!formErrors.hospitalLatitude}
                  helperText={formErrors.hospitalLatitude || "Coordonnée GPS requise"}
                />
                <TextField
                  fullWidth
                  label="Longitude *"
                  value={formData.hospitalLongitude}
                  onChange={(e) => setFormData({ ...formData, hospitalLongitude: e.target.value })}
                  placeholder="Ex: -1.55278"
                  error={!!formErrors.hospitalLongitude}
                  helperText={formErrors.hospitalLongitude || "Coordonnée GPS requise"}
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
                {submitting ? 'Ajout en cours...' : 'Ajouter l\'Hôpital'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setFormData({
                    hospitalName: '',
                    hospitalCity: '',
                    hospitalPostal: '',
                    hospitalAdress: '',
                    hospitalLatitude: '',
                    hospitalLongitude: '',
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
          {dialogType === 'view' && 'Détails de l\'Hôpital'}
          {dialogType === 'edit' && 'Modifier l\'Hôpital'}
          {dialogType === 'delete' && 'Supprimer l\'Hôpital'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <Box>
              <Typography>
                Êtes-vous sûr de vouloir supprimer l'hôpital "{selectedHospital?.hospitalName}" ?
              </Typography>
              
              {deleteWarning && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <AlertTitle>Attention</AlertTitle>
                  {deleteWarning.message}
                  
                  {deleteWarning.canForce && (
                    <FormControlLabel
                      sx={{ mt: 2, display: 'block' }}
                      control={
                        <Checkbox
                          checked={forceDelete}
                          onChange={(e) => setForceDelete(e.target.checked)}
                          color="warning"
                        />
                      }
                      label="Je comprends les conséquences et souhaite forcer la suppression (les livraisons associées seront dissociées)"
                    />
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
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Nom</Typography>
                <Typography variant="body1">{selectedHospital?.hospitalName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Adresse</Typography>
                <Typography variant="body1">{selectedHospital?.hospitalAdress}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Ville</Typography>
                  <Typography variant="body1">{selectedHospital?.hospitalCity}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Code Postal</Typography>
                  <Typography variant="body1">{selectedHospital?.hospitalPostal}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Latitude</Typography>
                  <Typography variant="body1">
                    {selectedHospital?.hospitalLatitude || 'Non définie'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Longitude</Typography>
                  <Typography variant="body1">
                    {selectedHospital?.hospitalLongitude || 'Non définie'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Nom de l'hôpital *"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                error={!!formErrors.hospitalName}
                helperText={formErrors.hospitalName}
              />
              <TextField
                fullWidth
                label="Adresse *"
                value={formData.hospitalAdress}
                onChange={(e) => setFormData({ ...formData, hospitalAdress: e.target.value })}
                error={!!formErrors.hospitalAdress}
                helperText={formErrors.hospitalAdress}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Ville *"
                  value={formData.hospitalCity}
                  onChange={(e) => setFormData({ ...formData, hospitalCity: e.target.value })}
                  error={!!formErrors.hospitalCity}
                  helperText={formErrors.hospitalCity}
                />
                <TextField
                  fullWidth
                  label="Code postal *"
                  value={formData.hospitalPostal}
                  onChange={(e) => setFormData({ ...formData, hospitalPostal: e.target.value })}
                  error={!!formErrors.hospitalPostal}
                  helperText={formErrors.hospitalPostal}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Latitude *"
                  value={formData.hospitalLatitude}
                  onChange={(e) => setFormData({ ...formData, hospitalLatitude: e.target.value })}
                  placeholder="Ex: 47.21806"
                  error={!!formErrors.hospitalLatitude}
                  helperText={formErrors.hospitalLatitude || "Coordonnée GPS requise"}
                />
                <TextField
                  fullWidth
                  label="Longitude *"
                  value={formData.hospitalLongitude}
                  onChange={(e) => setFormData({ ...formData, hospitalLongitude: e.target.value })}
                  placeholder="Ex: -1.55278"
                  error={!!formErrors.hospitalLongitude}
                  helperText={formErrors.hospitalLongitude || "Coordonnée GPS requise"}
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
              onClick={handleDeleteHospital}
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

export default SuperAdminHospitalManagement;