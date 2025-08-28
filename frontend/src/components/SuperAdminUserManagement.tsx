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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Refresh,
  Block,
  CheckCircle,
  Person,
  Email,
  BusinessCenter,
  LocalHospital
} from '@mui/icons-material';
import { api } from '../api/api';

interface User {
  userId: number;
  email: string;
  userName: string;
  userFirstname: string;
  userStatus: string;
  role?: {
    type: string;
    centerId?: number;
    hospitalId?: number;
    admin?: boolean;
    info?: string;
  };
}

const SuperAdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | 'add'>('edit');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/users');
      // S'assurer que response.data est un tableau
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Impossible de charger la liste des utilisateurs');
      setUsers([]); // Réinitialiser avec un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type: 'edit' | 'delete' | 'add', user?: User) => {
    setDialogType(type);
    setSelectedUser(user || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const getRoleColor = (roleType: string) => {
    switch (roleType) {
      case 'super_admin':
        return 'error';
      case 'hospital_admin':
        return 'primary';
      case 'donation_center_admin':
        return 'secondary';
      case 'dronist':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'hospital_admin':
        return <LocalHospital />;
      case 'donation_center_admin':
        return <BusinessCenter />;
      case 'dronist':
        return <Person />;
      default:
        return <Person />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des utilisateurs...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Button onClick={fetchUsers} sx={{ ml: 2 }}>
          Réessayer
        </Button>
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4 
      }}>
        {/* Stats utilisateurs */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' },
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Utilisateurs
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {users?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' },
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Actifs
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {users?.filter(u => u.userStatus === 'active')?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' },
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Admins
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {users?.filter(u => u.role?.type?.includes('admin'))?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' },
          minWidth: 0
        }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Dronistes
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {users?.filter(u => u.role?.type === 'dronist')?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2">
              Gestion des Utilisateurs
            </Typography>
            <Box>
              <Button
                startIcon={<Refresh />}
                onClick={fetchUsers}
                sx={{ mr: 2 }}
              >
                Actualiser
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('add')}
              >
                Nouvel Utilisateur
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(users || []).map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Person sx={{ mr: 1 }} />
                        {user.userFirstname} {user.userName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Email sx={{ mr: 1 }} />
                        {user.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role?.type || 'user')}
                        label={user.role?.type || 'user'}
                        color={getRoleColor(user.role?.type || 'user') as 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.userStatus === 'active' ? <CheckCircle /> : <Block />}
                        label={user.userStatus}
                        color={user.userStatus === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('edit', user)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('delete', user)}
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

      {/* Dialog pour les actions */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'add' && 'Nouvel Utilisateur'}
          {dialogType === 'edit' && 'Modifier Utilisateur'}
          {dialogType === 'delete' && 'Supprimer Utilisateur'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <Typography>
              Êtes-vous sûr de vouloir supprimer l'utilisateur {selectedUser?.userFirstname} {selectedUser?.userName} ?
            </Typography>
          ) : (
            <Box mt={2}>
              <TextField
                autoFocus
                margin="dense"
                label="Prénom"
                fullWidth
                variant="outlined"
                defaultValue={selectedUser?.userFirstname || ''}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Nom"
                fullWidth
                variant="outlined"
                defaultValue={selectedUser?.userName || ''}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                defaultValue={selectedUser?.email || ''}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={selectedUser?.role?.type || 'user'}
                  label="Rôle"
                >
                  <MenuItem value="user">Utilisateur</MenuItem>
                  <MenuItem value="dronist">Droniste</MenuItem>
                  <MenuItem value="hospital_admin">Admin Hôpital</MenuItem>
                  <MenuItem value="donation_center_admin">Admin Centre de Don</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={selectedUser?.userStatus || 'active'}
                  label="Statut"
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                  <MenuItem value="suspended">Suspendu</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            variant="contained" 
            color={dialogType === 'delete' ? 'error' : 'primary'}
          >
            {dialogType === 'delete' ? 'Supprimer' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminUserManagement;