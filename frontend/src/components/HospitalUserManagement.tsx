import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
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
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { hospitalAdminApi, type HospitalUser, type InviteHospitalUserRequest, type UpdateHospitalUserRequest } from '@/api/hospitalAdmin';

interface HospitalUserManagementProps {
  hospitalId: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const HospitalUserManagement: React.FC<HospitalUserManagementProps> = ({ hospitalId }) => {
  const [users, setUsers] = useState<HospitalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<HospitalUser | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [inviteForm, setInviteForm] = useState({
    email: '',
    userName: '',
    userFirstname: '',
    telNumber: '',
    info: ''
  });

  const [editForm, setEditForm] = useState({
    userName: '',
    userFirstname: '',
    telNumber: '',
    userStatus: 'active' as 'active' | 'suspended' | 'pending',
    info: ''
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hospitalAdminApi.getUsers(hospitalId);
      setUsers(response.users);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setSnackbar({ open: true, message: 'Erreur lors du chargement des utilisateurs', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Gestion du form d'invitation
  const handleInviteSubmit = async () => {
    try {
      const userData: InviteHospitalUserRequest = {
        email: inviteForm.email,
        userName: inviteForm.userName,
        userFirstname: inviteForm.userFirstname,
        ...(inviteForm.telNumber && { telNumber: parseInt(inviteForm.telNumber) }),
        ...(inviteForm.info && { info: inviteForm.info })
      };

      await hospitalAdminApi.inviteUser(hospitalId, userData);
      setSnackbar({ open: true, message: 'Invitation envoyée avec succès', severity: 'success' });
      setOpenInviteDialog(false);
      setInviteForm({ email: '', userName: '', userFirstname: '', telNumber: '', info: '' });
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de l\'invitation:', error);
      const apiError = error as ApiError;
      setSnackbar({ 
        open: true, 
        message: apiError.response?.data?.message || 'Erreur lors de l\'invitation', 
        severity: 'error' 
      });
    }
  };

  // Gestion du formd'edition
  const handleEditSubmit = async () => {
    if (!selectedUser) return;

    try {
      const userData: UpdateHospitalUserRequest = {
        userName: editForm.userName,
        userFirstname: editForm.userFirstname,
        userStatus: editForm.userStatus,
        ...(editForm.telNumber && { telNumber: parseInt(editForm.telNumber) }),
        info: editForm.info
      };

      await hospitalAdminApi.updateUser(hospitalId, selectedUser.userId, userData);
      setSnackbar({ open: true, message: 'Utilisateur mis à jour avec succès', severity: 'success' });
      setOpenEditDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      const apiError = error as ApiError;
      setSnackbar({ 
        open: true, 
        message: apiError.response?.data?.message || 'Erreur lors de la mise à jour', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (user: HospitalUser) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.userName} ${user.userFirstname} ?`)) {
      return;
    }

    try {
      await hospitalAdminApi.deleteUser(hospitalId, user.userId);
      setSnackbar({ open: true, message: 'Utilisateur supprimé avec succès', severity: 'success' });
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      const apiError = error as ApiError;
      setSnackbar({ 
        open: true, 
        message: apiError.response?.data?.message || 'Erreur lors de la suppression', 
        severity: 'error' 
      });
    }
  };

  const openEditDialogForUser = (user: HospitalUser) => {
    setSelectedUser(user);
    setEditForm({
      userName: user.userName,
      userFirstname: user.userFirstname,
      telNumber: user.telNumber?.toString() || '',
      userStatus: user.userStatus,
      info: user.info || ''
    });
    setOpenEditDialog(true);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: { xs: 2, md: 3 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  const renderMobileCard = (user: HospitalUser) => (
    <Card key={user.userId} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="div">
              {user.userName} {user.userFirstname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <Chip 
            label={user.userStatus} 
            color={getStatusColor(user.userStatus)}
            size="small"
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Téléphone
            </Typography>
            <Typography variant="body2">
              {user.telNumber || '-'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Date de création
            </Typography>
            <Typography variant="body2">
              {new Date(user.dteCreate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        
        {user.info && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Informations
            </Typography>
            <Typography variant="body2">
              {user.info}
            </Typography>
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <IconButton onClick={() => openEditDialogForUser(user)} size="small">
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDelete(user)} size="small" color="error">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
          Gestion des Utilisateurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenInviteDialog(true)}
          fullWidth={isMobile}
        >
          {isMobile ? 'Inviter' : 'Inviter un utilisateur'}
        </Button>
      </Box>

      {isMobile ? (
        <Box>
          {users.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Aucun utilisateur trouvé</Typography>
            </Paper>
          ) : (
            users.map(renderMobileCard)
          )}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>{user.userFirstname}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.telNumber || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.userStatus} 
                      color={getStatusColor(user.userStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(user.dteCreate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEditDialogForUser(user)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ajout */}
      <Dialog 
        open={openInviteDialog} 
        onClose={() => setOpenInviteDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Inviter un nouvel utilisateur</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 }, mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Nom"
              value={inviteForm.userName}
              onChange={(e) => setInviteForm({ ...inviteForm, userName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Prénom"
              value={inviteForm.userFirstname}
              onChange={(e) => setInviteForm({ ...inviteForm, userFirstname: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Téléphone"
              type="number"
              value={inviteForm.telNumber}
              onChange={(e) => setInviteForm({ ...inviteForm, telNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Informations complémentaires"
              multiline
              rows={2}
              value={inviteForm.info}
              onChange={(e) => setInviteForm({ ...inviteForm, info: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInviteDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleInviteSubmit}
            variant="contained"
            disabled={!inviteForm.email || !inviteForm.userName || !inviteForm.userFirstname}
          >
            Envoyer l'invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* edit*/}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Modifier l'utilisateur</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 }, mt: 1 }}>
            <TextField
              label="Nom"
              value={editForm.userName}
              onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Prénom"
              value={editForm.userFirstname}
              onChange={(e) => setEditForm({ ...editForm, userFirstname: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Téléphone"
              type="number"
              value={editForm.telNumber}
              onChange={(e) => setEditForm({ ...editForm, telNumber: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={editForm.userStatus}
                onChange={(e) => setEditForm({ ...editForm, userStatus: e.target.value as 'active' | 'suspended' | 'pending' })}
                label="Statut"
              >
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="suspended">Suspendu</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Informations complémentaires"
              multiline
              rows={2}
              value={editForm.info}
              onChange={(e) => setEditForm({ ...editForm, info: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleEditSubmit}
            variant="contained"
            disabled={!editForm.userName || !editForm.userFirstname}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* notif */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HospitalUserManagement;