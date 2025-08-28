import React, { useState, useEffect } from 'react';
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
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des Administrateurs
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Inviter Admin Hôpital" />
          <Tab label="Inviter Admin Centre de Don" />
          <Tab label="Liste des Administrateurs" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Inviter un Administrateur d'Hôpital
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <SuperAdminInviteForm type="hospital" />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Inviter un Administrateur de Centre de Don
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <SuperAdminInviteForm type="donation_center" />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" component="h2">
                Liste des Administrateurs
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchAdmins}
                disabled={loading}
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
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Affiliation</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
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
                            <Typography variant="body2">
                              {admin.entityName}
                            </Typography>
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
                {admins.length === 0 && !loading && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      Aucun administrateur trouvé
                    </Typography>
                  </Box>
                )}
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l'Administrateur</DialogTitle>
        <DialogContent>
          <Box mt={2}>
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
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Supprimer l'Administrateur</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'administrateur {selectedAdmin?.userFirstname} {selectedAdmin?.userName} ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminAdminManagement;