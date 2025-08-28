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
    {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
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

  if (error && hospitals.length === 0) {
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
    <Box sx={{ 
      px: { xs: 2, sm: 3, md: 4, lg: 5 },
      py: { xs: 2, sm: 3 },
      maxWidth: '1400px',
      mx: 'auto'
    }}>
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
        Gestion des Hôpitaux
      </Typography>

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: { xs: 2, sm: 3 },
        overflow: 'auto'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              minWidth: { xs: 120, sm: 160 },
              px: { xs: 1, sm: 2 }
            }
          }}
        >
          <Tab label="Liste des Hôpitaux" />
          <Tab label="Ajouter un Hôpital" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Statistiques */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)' 
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 3, sm: 4 }
        }}>
          <Card sx={{ 
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 2,
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography 
                color="text.secondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Total Hôpitaux
              </Typography>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  color: '#1976d2'
                }}
              >
                {hospitals?.length || 0}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 2,
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography 
                color="text.secondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Nantes
              </Typography>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  color: '#2e7d32'
                }}
              >
                {hospitals?.filter(h => h.hospitalCity === 'Nantes')?.length || 0}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 2,
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography 
                color="text.secondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                En Maintenance
              </Typography>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  color: '#ed6c02'
                }}
              >
                {hospitals?.filter(h => h.hospitalStatus === 'maintenance')?.length || 0}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 2,
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography 
                color="text.secondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Capacité Totale
              </Typography>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  color: '#9c27b0'
                }}
              >
                {hospitals?.reduce((sum, h) => sum + (h.hospitalCapacity || 0), 0) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card sx={{ overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'stretch', sm: 'center' }} 
              mb={2}
              gap={{ xs: 2, sm: 0 }}
            >
              <Typography 
                variant="h5" 
                component="h2"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 'bold',
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                Liste des Hôpitaux
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchHospitals}
                size="medium"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 }
                }}
              >
                Actualiser
              </Button>
            </Box>

            {/* Vue desktop - tableau */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Adresse</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ville</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Code Postal</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(hospitals || []).map((hospital) => (
                      <TableRow key={hospital.hospitalId} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LocalHospital sx={{ mr: 1, color: '#f44336' }} />
                            <Typography fontWeight="medium">
                              {hospital.hospitalName}
                            </Typography>
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
                        <TableCell align="center">
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('view', hospital)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('edit', hospital)}
                              color="info"
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
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Vue mobile/tablet - cartes */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <Box sx={{ 
                display: 'grid',
                gap: { xs: 2, sm: 3 },
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(1, 1fr)' }
              }}>
                {(hospitals || []).map((hospital) => (
                  <Card 
                    key={hospital.hospitalId}
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Box sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocalHospital sx={{ mr: 1, color: '#f44336', fontSize: 28 }} />
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              color: '#f44336'
                            }}
                          >
                            {hospital.hospitalName}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box mb={1}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            Adresse
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              mt: 0.25
                            }}
                          >
                            {hospital.hospitalAdress}
                          </Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Box sx={{ flex: 1, mr: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                              Ville
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, mt: 0.25 }}
                            >
                              {hospital.hospitalCity}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                              Code Postal
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, mt: 0.25 }}
                            >
                              {hospital.hospitalPostal}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box display="flex" justifyContent="center" gap={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handleOpenDialog('view', hospital)}
                          sx={{ 
                            fontSize: '0.7rem',
                            px: 1.5,
                            py: 0.5,
                            minWidth: 'auto'
                          }}
                        >
                          Voir
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleOpenDialog('edit', hospital)}
                          sx={{ 
                            fontSize: '0.7rem',
                            px: 1.5,
                            py: 0.5,
                            minWidth: 'auto'
                          }}
                        >
                          Modifier
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleOpenDialog('delete', hospital)}
                          sx={{ 
                            fontSize: '0.7rem',
                            px: 1.5,
                            py: 0.5,
                            minWidth: 'auto'
                          }}
                        >
                          Supprimer
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              
              {hospitals.length === 0 && (
                <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Aucun hôpital trouvé
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ 
          maxWidth: { xs: '100%', sm: 800 }, 
          mx: 'auto',
          mt: { xs: 1, sm: 0 }
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 'bold',
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Ajouter un Nouvel Hôpital
            </Typography>
            <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, sm: 3 } }}>
              <TextField
                fullWidth
                label="Nom de l'hôpital *"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                error={!!formErrors.hospitalName}
                helperText={formErrors.hospitalName}
                size="medium"
              />
              <TextField
                fullWidth
                label="Adresse *"
                value={formData.hospitalAdress}
                onChange={(e) => setFormData({ ...formData, hospitalAdress: e.target.value })}
                error={!!formErrors.hospitalAdress}
                helperText={formErrors.hospitalAdress}
                size="medium"
              />
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 } 
              }}>
                <TextField
                  fullWidth
                  label="Ville *"
                  value={formData.hospitalCity}
                  onChange={(e) => setFormData({ ...formData, hospitalCity: e.target.value })}
                  error={!!formErrors.hospitalCity}
                  helperText={formErrors.hospitalCity}
                  size="medium"
                />
                <TextField
                  fullWidth
                  label="Code postal *"
                  value={formData.hospitalPostal}
                  onChange={(e) => setFormData({ ...formData, hospitalPostal: e.target.value })}
                  error={!!formErrors.hospitalPostal}
                  helperText={formErrors.hospitalPostal}
                  size="medium"
                />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 } 
              }}>
                <TextField
                  fullWidth
                  label="Latitude *"
                  value={formData.hospitalLatitude}
                  onChange={(e) => setFormData({ ...formData, hospitalLatitude: e.target.value })}
                  placeholder="Ex: 47.21806"
                  error={!!formErrors.hospitalLatitude}
                  helperText={formErrors.hospitalLatitude || "Coordonnée GPS requise"}
                  size="medium"
                />
                <TextField
                  fullWidth
                  label="Longitude *"
                  value={formData.hospitalLongitude}
                  onChange={(e) => setFormData({ ...formData, hospitalLongitude: e.target.value })}
                  placeholder="Ex: -1.55278"
                  error={!!formErrors.hospitalLongitude}
                  helperText={formErrors.hospitalLongitude || "Coordonnée GPS requise"}
                  size="medium"
                />
              </Box>
            </Box>

            <Box sx={{ 
              mt: { xs: 3, sm: 4 }, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 2 },
              justifyContent: { xs: 'stretch', sm: 'flex-start' }
            }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleSubmitForm}
                disabled={submitting}
                size="large"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 3, sm: 4 },
                  flex: { xs: 1, sm: 'none' }
                }}
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
                size="large"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 3, sm: 4 },
                  flex: { xs: 1, sm: 'none' }
                }}
              >
                Réinitialiser
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Dialog pour view/edit/delete */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: 'calc(100vh - 16px)', sm: 'calc(100vh - 64px)' },
            width: { xs: 'calc(100vw - 16px)', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 }
        }}>
          {dialogType === 'view' && 'Détails de l\'Hôpital'}
          {dialogType === 'edit' && 'Modifier l\'Hôpital'}
          {dialogType === 'delete' && 'Supprimer l\'Hôpital'}
        </DialogTitle>
        <DialogContent sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 1, sm: 2 },
          overflow: 'auto'
        }}>
          {dialogType === 'delete' ? (
            <Box>
              <Typography sx={{ mb: 2 }}>
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 2, sm: 2.5 },
              pt: { xs: 1, sm: 2 }
            }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Nom</Typography>
                <Typography variant="body1">{selectedHospital?.hospitalName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Adresse</Typography>
                <Typography variant="body1">{selectedHospital?.hospitalAdress}</Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 4 }
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Ville</Typography>
                  <Typography variant="body1">{selectedHospital?.hospitalCity}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Code Postal</Typography>
                  <Typography variant="body1">{selectedHospital?.hospitalPostal}</Typography>
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 4 }
              }}>
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
            <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, sm: 3 } }}>
              <TextField
                fullWidth
                label="Nom de l'hôpital *"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                error={!!formErrors.hospitalName}
                helperText={formErrors.hospitalName}
                size="medium"
              />
              <TextField
                fullWidth
                label="Adresse *"
                value={formData.hospitalAdress}
                onChange={(e) => setFormData({ ...formData, hospitalAdress: e.target.value })}
                error={!!formErrors.hospitalAdress}
                helperText={formErrors.hospitalAdress}
                size="medium"
              />
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 } 
              }}>
                <TextField
                  fullWidth
                  label="Ville *"
                  value={formData.hospitalCity}
                  onChange={(e) => setFormData({ ...formData, hospitalCity: e.target.value })}
                  error={!!formErrors.hospitalCity}
                  helperText={formErrors.hospitalCity}
                  size="medium"
                />
                <TextField
                  fullWidth
                  label="Code postal *"
                  value={formData.hospitalPostal}
                  onChange={(e) => setFormData({ ...formData, hospitalPostal: e.target.value })}
                  error={!!formErrors.hospitalPostal}
                  helperText={formErrors.hospitalPostal}
                  size="medium"
                />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 } 
              }}>
                <TextField
                  fullWidth
                  label="Latitude *"
                  value={formData.hospitalLatitude}
                  onChange={(e) => setFormData({ ...formData, hospitalLatitude: e.target.value })}
                  placeholder="Ex: 47.21806"
                  error={!!formErrors.hospitalLatitude}
                  helperText={formErrors.hospitalLatitude || "Coordonnée GPS requise"}
                  size="medium"
                />
                <TextField
                  fullWidth
                  label="Longitude *"
                  value={formData.hospitalLongitude}
                  onChange={(e) => setFormData({ ...formData, hospitalLongitude: e.target.value })}
                  placeholder="Ex: -1.55278"
                  error={!!formErrors.hospitalLongitude}
                  helperText={formErrors.hospitalLongitude || "Coordonnée GPS requise"}
                  size="medium"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          gap: { xs: 1, sm: 1.5 },
          flexDirection: { xs: 'column', sm: 'row' },
          '& .MuiButton-root': {
            width: { xs: '100%', sm: 'auto' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            py: { xs: 1, sm: 0.75 }
          }
        }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            {dialogType === 'view' ? 'Fermer' : 'Annuler'}
          </Button>
          {dialogType === 'delete' && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleDeleteHospital}
              disabled={submitting}
              sx={{ order: { xs: 1, sm: 2 } }}
            >
              {submitting ? 'Suppression...' : 'Supprimer'}
            </Button>
          )}
          {dialogType === 'edit' && (
            <Button 
              variant="contained" 
              onClick={handleSubmitForm}
              disabled={submitting}
              sx={{ order: { xs: 1, sm: 2 } }}
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