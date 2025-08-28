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
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit,
  Delete,
  Refresh,
  AdminPanelSettings,
  LocalHospital,
  BusinessCenter,
  Email,
  Person
} from '@mui/icons-material';
import SuperAdminInviteForm from './SuperAdminInviteForm';
import { api } from '../api/api';

interface Admin {
  userId: number;
  email: string;
  userName: string;
  userFirstname: string;
  userStatus: string;
  telNumber?: string;
  entityType: string;
  entityId: number;
  entityName: string;
  admin: boolean;
  info?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && (
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {children}
      </Box>
    )}
  </div>
);

const SuperAdminAdminManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    userFirstname: '',
    userName: '',
    email: '',
    userStatus: 'active'
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/admins');
      const adminsData = response.data.admins || response.data || [];
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des admins:', err);
      setError('Impossible de charger la liste des administrateurs');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 2) {
      fetchAdmins();
    }
  }, [tabValue]);

  const handleOpenEditDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      userFirstname: admin.userFirstname,
      userName: admin.userName,
      email: admin.email,
      userStatus: admin.userStatus
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedAdmin(null);
  };

  const handleOpenDeleteDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAdmin(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedAdmin) return;
    
    try {
      await api.put(`/superadmin/admins/${selectedAdmin.userId}`, {
        userFirstname: formData.userFirstname,
        userName: formData.userName,
        email: formData.email,
        userStatus: formData.userStatus
      });
      
      handleCloseEditDialog();
      await fetchAdmins();
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la modification';
      setError(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdmin) return;
    
    try {
      await api.delete(`/superadmin/admins/${selectedAdmin.userId}`);
      handleCloseDeleteDialog();
      await fetchAdmins();
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMessage);
    }
  };

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
        Gestion des Administrateurs
      </Typography>

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: { xs: 2, sm: 3 },
        '& .MuiTabs-root': {
          minHeight: { xs: 40, sm: 48 }
        }
      }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minWidth: { xs: 120, sm: 160 },
              padding: { xs: '8px 12px', sm: '12px 16px' }
            }
          }}
        >
          <Tab label="Inviter Admin Hôpital" />
          <Tab label="Inviter Admin Centre de Don" />
          <Tab label="Liste des Administrateurs" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card sx={{ 
          maxWidth: { xs: '100%', md: 800 }, 
          mx: 'auto',
          border: '1px solid #e0e0e0',
          boxShadow: { xs: 1, sm: 2 }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 'bold',
                textAlign: { xs: 'center', sm: 'left' },
                mb: { xs: 2, sm: 3 }
              }}
            >
              Inviter un Administrateur d'Hôpital
            </Typography>
            <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
            <SuperAdminInviteForm type="hospital" />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ 
          maxWidth: { xs: '100%', md: 800 }, 
          mx: 'auto',
          border: '1px solid #e0e0e0',
          boxShadow: { xs: 1, sm: 2 }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 'bold',
                textAlign: { xs: 'center', sm: 'left' },
                mb: { xs: 2, sm: 3 }
              }}
            >
              Inviter un Administrateur de Centre de Don
            </Typography>
            <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
            <SuperAdminInviteForm type="donation_center" />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card sx={{ 
          border: '1px solid #e0e0e0',
          boxShadow: { xs: 1, sm: 2 }
        }}>
          <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Box 
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: { xs: 'center', sm: 'space-between' },
                alignItems: { xs: 'center', sm: 'center' },
                gap: { xs: 2, sm: 0 },
                mb: { xs: 2, sm: 3 }
              }}
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
                Liste des Administrateurs
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchAdmins}
                disabled={loading}
                size="medium"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: 120, sm: 'auto' },
                  py: { xs: 0.5, sm: 1 },
                  px: { xs: 1, sm: 2 }
                }}
              >
                Actualiser
              </Button>
            </Box>

            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Chargement des administrateurs...
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
                <Button onClick={fetchAdmins} sx={{ ml: 2 }}>
                  Réessayer
                </Button>
              </Alert>
            )}

            {!loading && !error && (
              <>
                {/* Vue desktop - tableau */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <TableContainer 
                    component={Paper}
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      borderRadius: 2
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Affiliation</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {admins.map((admin) => (
                          <TableRow key={`${admin.userId}-${admin.entityType}-${admin.entityId}`} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Person sx={{ mr: 1 }} />
                                {admin.userFirstname} {admin.userName}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Email sx={{ mr: 1, fontSize: 18 }} />
                                {admin.email}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<AdminPanelSettings />}
                                label={admin.entityType === 'hospital' ? 'Admin Hôpital' : 'Admin Centre'}
                                color={admin.entityType === 'hospital' ? 'primary' : 'secondary'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                {admin.entityType === 'hospital' && <LocalHospital sx={{ mr: 1, fontSize: 18 }} />}
                                {admin.entityType === 'donation_center' && <BusinessCenter sx={{ mr: 1, fontSize: 18 }} />}
                                {admin.entityName}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={admin.userStatus === 'active' ? 'Actif' : 'Inactif'}
                                color={admin.userStatus === 'active' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEditDialog(admin)}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(admin)}
                              >
                                <Delete />
                              </IconButton>
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
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }
                  }}>
                    {admins.map((admin) => (
                      <Card 
                        key={`${admin.userId}-${admin.entityType}-${admin.entityId}`}
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
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Person sx={{ fontSize: 18 }} />
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                              }}>
                                {admin.userFirstname} {admin.userName}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                wordBreak: 'break-word'
                              }}>
                                {admin.email}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                Type
                              </Typography>
                              <Chip
                                icon={<AdminPanelSettings sx={{ fontSize: 14 }} />}
                                label={admin.entityType === 'hospital' ? 'Admin Hôpital' : 'Admin Centre'}
                                color={admin.entityType === 'hospital' ? 'primary' : 'secondary'}
                                size="small"
                                sx={{ fontSize: '0.6rem', height: 20 }}
                              />
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                Affiliation
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                {admin.entityType === 'hospital' && <LocalHospital sx={{ fontSize: 14 }} />}
                                {admin.entityType === 'donation_center' && <BusinessCenter sx={{ fontSize: 14 }} />}
                                <Typography variant="body2" sx={{ 
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  maxWidth: 120,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {admin.entityName}
                                </Typography>
                              </Box>
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                Statut
                              </Typography>
                              <Chip
                                label={admin.userStatus === 'active' ? 'Actif' : 'Inactif'}
                                color={admin.userStatus === 'active' ? 'success' : 'default'}
                                size="small"
                                sx={{ fontSize: '0.6rem', height: 20 }}
                              />
                            </Box>
                          </Box>

                          <Box display="flex" justifyContent="center" gap={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<Edit />}
                              onClick={() => handleOpenEditDialog(admin)}
                              sx={{ 
                                fontSize: '0.7rem',
                                px: 1.5,
                                py: 0.5
                              }}
                            >
                              Modifier
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleOpenDeleteDialog(admin)}
                              sx={{ 
                                fontSize: '0.7rem',
                                px: 1.5,
                                py: 0.5
                              }}
                            >
                              Supprimer
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>

                {admins.length === 0 && (
                  <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Aucun administrateur trouvé
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabPanel>
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: '90vh' },
            width: { xs: '100%', sm: 'auto' },
            height: { xs: '100%', sm: 'auto' }
          },
          '& .MuiDialog-container': {
            alignItems: { xs: 'stretch', sm: 'center' }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          fontWeight: 'bold',
          pb: { xs: 1, sm: 2 }
        }}>
          Modifier l'Administrateur
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box mt={{ xs: 1, sm: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Prénom"
              fullWidth
              variant="outlined"
              value={formData.userFirstname}
              onChange={(e) => setFormData({...formData, userFirstname: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Nom"
              fullWidth
              variant="outlined"
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={formData.userStatus}
                label="Statut"
                onChange={(e) => setFormData({...formData, userStatus: e.target.value})}
              >
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="inactive">Inactif</MenuItem>
                <MenuItem value="suspended">Suspendu</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={handleCloseEditDialog}
            sx={{ 
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveEdit}
            sx={{ 
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            height: { xs: '100%', sm: 'auto' }
          },
          '& .MuiDialog-container': {
            alignItems: { xs: 'stretch', sm: 'center' }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          fontWeight: 'bold',
          pb: { xs: 1, sm: 2 }
        }}>
          Supprimer l'Administrateur
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Êtes-vous sûr de vouloir supprimer l'administrateur {selectedAdmin?.userFirstname} {selectedAdmin?.userName} ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{ 
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete}
            sx={{ 
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminAdminManagement;