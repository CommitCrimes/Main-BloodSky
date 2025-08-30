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

interface LambdaUser {
  userId: number;
  email: string;
  userName: string;
  userFirstname: string;
  userStatus: string;
  telNumber?: string;
  dteCreate: string;
  role?: {
    type: string;
    hospitalId?: number;
    hospitalName?: string;
    centerId?: number;
    centerName?: string;
    admin: boolean;
  };
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
  const [users, setUsers] = useState<LambdaUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [selectedUser, setSelectedUser] = useState<LambdaUser | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);
  const [formData, setFormData] = useState({
    userFirstname: '',
    userName: '',
    email: '',
    userStatus: 'active'
  });
  const [userFormData, setUserFormData] = useState({
    userFirstname: '',
    userName: '',
    email: ''
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/users');
      const usersData = response.data.users || response.data || [];
      
      // Filtrer seulement les utilisateurs lambda (pas les admins ni le super admin)
      const lambdaUsers = usersData.filter((user: any) => {
        return user.role && user.role.type === 'user' && user.role.admin === false;
      });
      
      setUsers(Array.isArray(lambdaUsers) ? lambdaUsers : []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Impossible de charger la liste des utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 2) {
      fetchAdmins();
    } else if (tabValue === 3) {
      fetchUsers();
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

  // Handlers pour les utilisateurs lambda
  const handleOpenEditUserDialog = (user: LambdaUser) => {
    setSelectedUser(user);
    setUserFormData({
      userFirstname: user.userFirstname,
      userName: user.userName,
      email: user.email
    });
    setOpenEditUserDialog(true);
  };

  const handleCloseEditUserDialog = () => {
    setOpenEditUserDialog(false);
    setSelectedUser(null);
  };

  const handleOpenDeleteUserDialog = (user: LambdaUser) => {
    setSelectedUser(user);
    setOpenDeleteUserDialog(true);
  };

  const handleCloseDeleteUserDialog = () => {
    setOpenDeleteUserDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUserEdit = async () => {
    if (!selectedUser) return;
    
    try {
      // Utiliser l'endpoint spécifique aux utilisateurs
      await api.put(`/superadmin/users/${selectedUser.userId}`, {
        userFirstname: userFormData.userFirstname,
        userName: userFormData.userName,
        email: userFormData.email
      });
      
      handleCloseEditUserDialog();
      await fetchUsers();
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la modification de l\'utilisateur:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la modification';
      setError(errorMessage);
    }
  };

  const handleConfirmUserDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await api.delete(`/superadmin/users/${selectedUser.userId}`);
      handleCloseDeleteUserDialog();
      await fetchUsers();
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
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
          <Tab label="Liste des Utilisateurs" />
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
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {error}
                <Button onClick={fetchAdmins} sx={{ ml: 2 }}>
                  Réessayer
                </Button>
              </Alert>
            )}

            {!loading && !error && (
              <>
                {/* Vue desktop - tableau */}
                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
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
                <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
                  <Box sx={{ 
                    display: 'grid',
                    gap: { xs: 1, sm: 1.5 },
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
                        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                          <Box sx={{ mb: 1.5 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                              <Person sx={{ fontSize: 18 }} />
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.8rem', sm: '0.9rem' }
                              }}>
                                {admin.userFirstname} {admin.userName}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" gap={1} mb={0.75}>
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

                          <Box sx={{ mb: 1.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
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

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                Affiliation
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                {admin.entityType === 'hospital' && <LocalHospital sx={{ fontSize: 14 }} />}
                                {admin.entityType === 'donation_center' && <BusinessCenter sx={{ fontSize: 14 }} />}
                                <Typography variant="body2" sx={{ 
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
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

      <TabPanel value={tabValue} index={3}>
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
                Liste des Utilisateurs Lambda
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchUsers}
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
                  Chargement des utilisateurs...
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {error}
                <Button onClick={fetchUsers} sx={{ ml: 2 }}>
                  Réessayer
                </Button>
              </Alert>
            )}

            {!loading && !error && (
              <>
                {/* Vue desktop - tableau */}
                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                  <TableContainer 
                    component={Paper}
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      overflowX: 'auto',
                      maxWidth: '100%',
                      '& .MuiTable-root': {
                        minWidth: 900
                      }
                    }}
                  >
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Nom</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', minWidth: 180 }}>Établissement</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Statut</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Date création</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.userId} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Person sx={{ mr: 1 }} />
                                {user.userFirstname} {user.userName}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Email sx={{ mr: 1, fontSize: 18 }} />
                                {user.email}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                {user.role?.hospitalId && <LocalHospital sx={{ mr: 1, fontSize: 18 }} />}
                                {user.role?.centerId && <BusinessCenter sx={{ mr: 1, fontSize: 18 }} />}
                                {user.role?.hospitalName || user.role?.centerName || 'Non assigné'}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.role?.hospitalId ? 'User Hôpital' : 'User Centre'}
                                color={user.role?.hospitalId ? 'primary' : 'secondary'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.userStatus === 'active' ? 'Actif' : 'Inactif'}
                                color={user.userStatus === 'active' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(user.dteCreate).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEditUserDialog(user)}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteUserDialog(user)}
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
                <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 1, sm: 1.5 },
                    px: { xs: 0.5, sm: 0 } // Padding horizontal pour mobile
                  }}>
                    {users.map((user) => (
                      <Card 
                        key={user.userId}
                        sx={{ 
                          border: '1px solid #e0e0e0',
                          '&:hover': { boxShadow: 2 },
                          width: '100%',
                          maxWidth: '100%',
                          borderRadius: { xs: 1, sm: 2 }
                        }}
                      >
                        <CardContent sx={{ 
                          p: { xs: 1.5, sm: 2 },
                          '&:last-child': { pb: { xs: 1.5, sm: 2 } }
                        }}>
                          {/* Header avec nom et actions */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            mb: 1.5,
                            gap: 0.5
                          }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="h6" 
                                component="div"
                                sx={{ 
                                  fontSize: { xs: '1rem', sm: '1.1rem' },
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 0.25,
                                  wordBreak: 'break-word'
                                }}
                              >
                                <Person sx={{ mr: 1, fontSize: { xs: 18, sm: 20 }, flexShrink: 0 }} />
                                {user.userFirstname} {user.userName}
                              </Typography>
                              <Typography 
                                color="text.secondary" 
                                sx={{ 
                                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                  display: 'flex',
                                  alignItems: 'center',
                                  wordBreak: 'break-word'
                                }}
                              >
                                <Email sx={{ mr: 1, fontSize: { xs: 16, sm: 18 }, flexShrink: 0 }} />
                                {user.email}
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 0.5,
                              flexShrink: 0
                            }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEditUserDialog(user)}
                                sx={{ 
                                  p: { xs: 0.75, sm: 1 },
                                  '& .MuiSvgIcon-root': { fontSize: { xs: 16, sm: 18 } }
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteUserDialog(user)}
                                sx={{ 
                                  p: { xs: 0.75, sm: 1 },
                                  '& .MuiSvgIcon-root': { fontSize: { xs: 16, sm: 18 } }
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>

                          <Divider sx={{ mb: 1.5 }} />

                          {/* Détails en grid responsive */}
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: { 
                              xs: '1fr', 
                              sm: 'repeat(2, 1fr)',
                              md: 'repeat(3, 1fr)' 
                            },
                            gap: { xs: 1, sm: 1.5, md: 2 }
                          }}>
                            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                  display: 'block',
                                  mb: 0.25
                                }}
                              >
                                Établissement
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5, 
                                mt: 0.5 
                              }}>
                                {user.role?.hospitalId && <LocalHospital sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />}
                                {user.role?.centerId && <BusinessCenter sx={{ fontSize: { xs: 16, sm: 18 }, color: 'secondary.main' }} />}
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                    fontWeight: 500,
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {user.role?.hospitalName || user.role?.centerName || 'Non assigné'}
                                </Typography>
                              </Box>
                            </Box>

                            <Box>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              >
                                Type
                              </Typography>
                              <Box>
                                <Chip
                                  label={user.role?.hospitalId ? 'User Hôpital' : 'User Centre'}
                                  color={user.role?.hospitalId ? 'primary' : 'secondary'}
                                  size="small"
                                  sx={{ 
                                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                    height: { xs: 20, sm: 24 },
                                    '& .MuiChip-label': { 
                                      px: { xs: 0.75, sm: 1 }
                                    }
                                  }}
                                />
                              </Box>
                            </Box>

                            <Box>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              >
                                Statut
                              </Typography>
                              <Box>
                                <Chip
                                  label={user.userStatus === 'active' ? 'Actif' : 'Inactif'}
                                  color={user.userStatus === 'active' ? 'success' : 'default'}
                                  size="small"
                                  sx={{ 
                                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                    height: { xs: 20, sm: 24 },
                                    '& .MuiChip-label': { 
                                      px: { xs: 0.75, sm: 1 }
                                    }
                                  }}
                                />
                              </Box>
                            </Box>

                            <Box>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              >
                                Date de création
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                  fontWeight: 500,
                                  mt: 0.5
                                }}
                              >
                                {new Date(user.dteCreate).toLocaleDateString('fr-FR')}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>

                {/* Message si aucun utilisateur */}
                {users.length === 0 && (
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center" 
                    height="200px"
                    flexDirection="column"
                  >
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Aucun utilisateur lambda trouvé
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Les utilisateurs lambda apparaîtront ici une fois créés par les administrateurs.
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
              sx={{ mb: 1.5 }}
            />
            <TextField
              margin="dense"
              label="Nom"
              fullWidth
              variant="outlined"
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              sx={{ mb: 1.5 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              sx={{ mb: 1.5 }}
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

      {/* Dialogues pour les utilisateurs lambda */}
      <Dialog 
        open={openEditUserDialog} 
        onClose={handleCloseEditUserDialog} 
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
          Modifier l'Utilisateur
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            pt: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 1.5, sm: 2 }
          }}>
            <TextField
              label="Prénom"
              value={userFormData.userFirstname}
              onChange={(e) => setUserFormData({...userFormData, userFirstname: e.target.value})}
              fullWidth
              size={window.innerWidth < 600 ? 'small' : 'medium'}
            />
            <TextField
              label="Nom"
              value={userFormData.userName}
              onChange={(e) => setUserFormData({...userFormData, userName: e.target.value})}
              fullWidth
              size={window.innerWidth < 600 ? 'small' : 'medium'}
            />
            <TextField
              label="Email"
              value={userFormData.email}
              onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
              fullWidth
              disabled
              size={window.innerWidth < 600 ? 'small' : 'medium'}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={handleCloseEditUserDialog}
            sx={{ 
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveUserEdit}
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
        open={openDeleteUserDialog} 
        onClose={handleCloseDeleteUserDialog}
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
          Supprimer l'Utilisateur
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Êtes-vous sûr de vouloir supprimer l'utilisateur {selectedUser?.userFirstname} {selectedUser?.userName} ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={handleCloseDeleteUserDialog}
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
            onClick={handleConfirmUserDelete}
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