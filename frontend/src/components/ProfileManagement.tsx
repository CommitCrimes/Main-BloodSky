/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Paper,
  Stack,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Person, 
  Email, 
  Phone, 
  Business, 
  AdminPanelSettings,
  Lock,
  Visibility,
  VisibilityOff,
  Close,
  LocationOn,
  CalendarToday,
  Edit,
  Save,
  Cancel,
  VpnKey
} from '@mui/icons-material';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import type { UpdateProfileRequest, ChangePasswordRequest, UpdateCoordinatesRequest } from '../stores/profileStore';

const ProfileManagement: React.FC = observer(() => {
  const profileStore = useProfile();
  const auth = useAuth();
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    userName: '',
    userFirstname: '',
    telNumber: undefined,
    info: ''
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    match: ''
  });
  const [coordinatesData, setCoordinatesData] = useState<UpdateCoordinatesRequest>({
    latitude: '',
    longitude: ''
  });
  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false);

  useEffect(() => {
    profileStore.getMyProfile();
  }, [profileStore]);

  useEffect(() => {
    if (profileStore.profile) {
      setFormData({
        userName: profileStore.profile.userName || '',
        userFirstname: profileStore.profile.userFirstname || '',
        telNumber: profileStore.profile.telNumber || undefined,
        info: profileStore.profile.role?.info || ''
      });
      
      if (profileStore.profile.role?.admin) {
        setCoordinatesData({
          latitude: profileStore.profile.role.hospitalLatitude || profileStore.profile.role.centerLatitude || '',
          longitude: profileStore.profile.role.hospitalLongitude || profileStore.profile.role.centerLongitude || ''
        });
      }
    }
  }, [profileStore.profile]);

  useEffect(() => {
    const errors = { newPassword: '', confirmPassword: '', match: '' };
    
    if (passwordData.newPassword && passwordData.newPassword.length < 8) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (passwordData.newPassword && !/^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(passwordData.newPassword)) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 1 majuscule et 1 chiffre';
    }    
    if (passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      errors.match = 'Les mots de passe ne correspondent pas';
    }
    
    setPasswordErrors(errors);
  }, [passwordData.newPassword, passwordData.confirmPassword]);

  const handleInputChange = (field: keyof UpdateProfileRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'telNumber' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handlePasswordChange = (field: keyof ChangePasswordRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCoordinatesChange = (field: keyof UpdateCoordinatesRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCoordinatesData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    const success = await profileStore.updateMyProfile(formData);
    if (success) {
      setIsEditing(false);
      setSuccessMessage('Profil mis à jour avec succès !');
      if (auth.user && profileStore.profile) {
        auth.setUser({
          ...auth.user,
          userName: profileStore.profile.userName,
          userFirstname: profileStore.profile.userFirstname
        });
      }
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (passwordErrors.newPassword || passwordErrors.match) {
      return;
    }
    
    const success = await profileStore.changePassword(passwordData);
    if (success) {
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({ newPassword: '', confirmPassword: '', match: '' });
      setSuccessMessage('Mot de passe modifié avec succès !');
    }
  };

  const handleCancel = () => {
    if (profileStore.profile) {
      setFormData({
        userName: profileStore.profile.userName || '',
        userFirstname: profileStore.profile.userFirstname || '',
        telNumber: profileStore.profile.telNumber || undefined,
        info: profileStore.profile.role?.info || ''
      });
    }
    setIsEditing(false);
    profileStore.clearError();
  };

  const handleCancelPassword = () => {
    setShowPasswordDialog(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({ newPassword: '', confirmPassword: '', match: '' });
    profileStore.clearError();
  };

  const handleCoordinatesSubmit = async () => {
    const isHospitalAdmin = profileStore.profile?.role?.type === 'hospital_admin';
    const success = isHospitalAdmin 
      ? await profileStore.updateHospitalCoordinates(coordinatesData)
      : await profileStore.updateCenterCoordinates(coordinatesData);
    
    if (success) {
      setIsEditingCoordinates(false);
      setSuccessMessage('Coordonnées mises à jour avec succès !');
    }
  };

  const handleCancelCoordinates = () => {
    if (profileStore.profile?.role?.admin) {
      setCoordinatesData({
        latitude: profileStore.profile.role.hospitalLatitude || profileStore.profile.role.centerLatitude || '',
        longitude: profileStore.profile.role.hospitalLongitude || profileStore.profile.role.centerLongitude || ''
      });
    }
    setIsEditingCoordinates(false);
    profileStore.clearError();
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getRoleDisplayName = (roleType?: string) => {
    switch (roleType) {
      case 'super_admin':
        return 'Super Administrateur';
      case 'hospital_admin':
        return 'Administrateur Hôpital';
      case 'donation_center_admin':
        return 'Administrateur Centre de Don';
      case 'user':
        return 'Utilisateur';
      default:
        return 'Non défini';
    }
  };

  const getRoleColor = (roleType?: string): 'error' | 'primary' | 'secondary' | 'default' => {
    switch (roleType) {
      case 'super_admin':
        return 'error';
      case 'hospital_admin':
        return 'primary';
      case 'donation_center_admin':
        return 'secondary';
      case 'user':
        return 'default';
      default:
        return 'default';
    }
  };

  const isPasswordFormValid = () => {
    return passwordData.currentPassword && 
           passwordData.newPassword && 
           passwordData.confirmPassword &&
           !passwordErrors.newPassword && 
           !passwordErrors.match;
  };

  if (profileStore.isLoading && !profileStore.profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!profileStore.profile) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Impossible de charger les informations du profil.
        </Alert>
      </Box>
    );
  }

  const { profile } = profileStore;

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f8fe 0%, #f0f9ff 100%)',
        p: { xs: 2, md: 4 }
      }}
    >
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '24px',
            p: { xs: 3, md: 4 },
            mb: 4,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              color: '#981A0E', 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              fontFamily: 'Iceland, cursive',
              mb: 1,
              background: 'linear-gradient(45deg, #981A0E, #C41E3A)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Mon Profil
          </Typography>
          <Typography 
            variant="subtitle1"
            sx={{ 
              color: '#5C7F9B', 
              fontFamily: 'Share Tech, monospace',
              opacity: 0.8,
              fontSize: { xs: '0.9rem', md: '1.1rem' }
            }}
          >
            Gérez vos informations personnelles et préférences
          </Typography>
        </Paper>
      </Fade>

      {profileStore.error && (
        <Zoom in timeout={600}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '16px',
              '& .MuiAlert-message': {
                fontFamily: 'Share Tech, monospace'
              }
            }} 
            onClose={() => profileStore.clearError()}
          >
            {profileStore.error}
          </Alert>
        </Zoom>
      )}

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3 
        }}
      >
        <Box sx={{ flex: { lg: 2 } }}>
          <Fade in timeout={1000}>
            <Card 
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '24px',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction="row" spacing={3} alignItems="center" mb={4}>
                  <Avatar 
                    sx={{ 
                      background: 'linear-gradient(45deg, #981A0E, #C41E3A)',
                      width: { xs: 64, md: 80 }, 
                      height: { xs: 64, md: 80 },
                      boxShadow: '0 8px 24px rgba(152, 26, 14, 0.3)',
                      fontFamily: 'Share Tech, monospace',
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 'bold'
                    }}
                  >
                    {profile.userFirstname?.charAt(0).toUpperCase()}{profile.userName?.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h4"
                      sx={{ 
                        fontFamily: 'Share Tech, monospace',
                        color: '#2D3748',
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      {profile.userFirstname} {profile.userName}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={getRoleDisplayName(profile.role?.type)}
                        color={getRoleColor(profile.role?.type)}
                        size="medium"
                        icon={<AdminPanelSettings />}
                        sx={{ 
                          fontFamily: 'Share Tech, monospace',
                          borderRadius: '12px',
                          fontWeight: 500
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 4, opacity: 0.3 }} />

                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Share Tech, monospace',
                      color: '#2D3748',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Person sx={{ color: '#008EFF' }} />
                    Informations personnelles
                  </Typography>
                  
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3
                      }}
                    >
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                        <TextField
                          fullWidth
                          label="Prénom"
                          value={formData.userFirstname}
                          onChange={handleInputChange('userFirstname')}
                          disabled={!isEditing}
                          variant="outlined"
                          slotProps={{
                            input: {
                              startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                              readOnly: !isEditing,
                              sx: {
                                borderRadius: '12px',
                                backgroundColor: isEditing ? 'rgba(0, 142, 255, 0.05)' : 'rgba(0,0,0,0.02)'
                              }
                            },
                            inputLabel: {
                              sx: { fontFamily: 'Share Tech, monospace' }
                            }
                          }}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Share Tech, monospace'
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                        <TextField
                          fullWidth
                          label="Nom"
                          value={formData.userName}
                          onChange={handleInputChange('userName')}
                          disabled={!isEditing}
                          variant="outlined"
                          slotProps={{
                            input: {
                              startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                              readOnly: !isEditing,
                              sx: {
                                borderRadius: '12px',
                                backgroundColor: isEditing ? 'rgba(0, 142, 255, 0.05)' : 'rgba(0,0,0,0.02)'
                              }
                            },
                            inputLabel: {
                              sx: { fontFamily: 'Share Tech, monospace' }
                            }
                          }}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Share Tech, monospace'
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3
                      }}
                    >
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={profile.email}
                          disabled
                          variant="outlined"
                          slotProps={{
                            input: {
                              startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                              readOnly: true,
                              sx: {
                                borderRadius: '12px',
                                backgroundColor: 'rgba(0,0,0,0.02)'
                              }
                            },
                            inputLabel: {
                              sx: { fontFamily: 'Share Tech, monospace' }
                            }
                          }}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Share Tech, monospace'
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px'
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                        <TextField
                          fullWidth
                          label="Téléphone"
                          type="tel"
                          value={formData.telNumber || ''}
                          onChange={handleInputChange('telNumber')}
                          disabled={!isEditing}
                          variant="outlined"
                          slotProps={{
                            input: {
                              startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                              readOnly: !isEditing,
                              sx: {
                                borderRadius: '12px',
                                backgroundColor: isEditing ? 'rgba(0, 142, 255, 0.05)' : 'rgba(0,0,0,0.02)'
                              }
                            },
                            inputLabel: {
                              sx: { fontFamily: 'Share Tech, monospace' }
                            }
                          }}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Share Tech, monospace'
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        />
                      </Box>
                    </Box>

                    {profile.role?.info !== undefined && (
                      <TextField
                        fullWidth
                        label="Informations supplémentaires"
                        multiline
                        rows={3}
                        value={formData.info}
                        onChange={handleInputChange('info')}
                        disabled={!isEditing}
                        variant="outlined"
                        slotProps={{
                          input: {
                            startAdornment: <Business sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />,
                            readOnly: !isEditing,
                            sx: {
                              borderRadius: '12px',
                              backgroundColor: isEditing ? 'rgba(0, 142, 255, 0.05)' : 'rgba(0,0,0,0.02)'
                            }
                          },
                          inputLabel: {
                            sx: { fontFamily: 'Share Tech, monospace' }
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: 'Share Tech, monospace'
                          },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                  {!isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setIsEditing(true)}
                        sx={{ 
                          bgcolor: '#008EFF',
                          '&:hover': { 
                            bgcolor: '#0066cc',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0, 142, 255, 0.3)'
                          },
                          fontFamily: 'Share Tech, monospace',
                          borderRadius: '12px',
                          px: 3,
                          py: 1.5,
                          transition: 'all 0.2s ease-in-out',
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        Modifier le profil
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<VpnKey />}
                        onClick={() => setShowPasswordDialog(true)}
                        sx={{ 
                          color: '#008EFF',
                          borderColor: '#008EFF',
                          '&:hover': { 
                            borderColor: '#0066cc', 
                            color: '#0066cc',
                            backgroundColor: 'rgba(0, 142, 255, 0.05)',
                            transform: 'translateY(-2px)'
                          },
                          fontFamily: 'Share Tech, monospace',
                          borderRadius: '12px',
                          px: 3,
                          py: 1.5,
                          transition: 'all 0.2s ease-in-out',
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        Changer le mot de passe
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={profileStore.isUpdating}
                        sx={{ 
                          fontFamily: 'Share Tech, monospace',
                          borderRadius: '12px',
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          color: '#6B7280',
                          borderColor: '#D1D5DB',
                          '&:hover': {
                            borderColor: '#9CA3AF',
                            backgroundColor: 'rgba(107, 114, 128, 0.05)'
                          }
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={profileStore.isUpdating ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        onClick={handleSubmit}
                        disabled={profileStore.isUpdating}
                        sx={{ 
                          bgcolor: '#10b981',
                          '&:hover': { 
                            bgcolor: '#059669',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                          },
                          fontFamily: 'Share Tech, monospace',
                          borderRadius: '12px',
                          px: 3,
                          py: 1.5,
                          transition: 'all 0.2s ease-in-out',
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        {profileStore.isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Box>

        {/* info du compte */}
        <Box sx={{ flex: { lg: 1 } }}>
          <Stack spacing={3}>
            <Fade in timeout={1200}>
              <Card 
                elevation={0}
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '24px',
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'Share Tech, monospace',
                      color: '#2D3748',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CalendarToday sx={{ color: '#008EFF' }} />
                    Informations du compte
                  </Typography>
                  
                  <Stack spacing={3}>
              

                    {profile.dteCreate && (
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ 
                            fontFamily: 'Share Tech, monospace',
                            mb: 0.5,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Membre depuis
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            backgroundColor: 'rgba(0, 142, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 142, 255, 0.1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          <Typography 
                            variant="body1"
                            sx={{ 
                              fontFamily: 'Share Tech, monospace',
                              color: '#2D3748',
                              fontWeight: 500
                            }}
                          >
                            {new Date(profile.dteCreate).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {profile.role?.hospitalName && (
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ 
                            fontFamily: 'Share Tech, monospace',
                            mb: 0.5,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Hôpital
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            backgroundColor: 'rgba(16, 185, 129, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          <Business sx={{ color: '#10b981', fontSize: 20 }} />
                          <Typography 
                            variant="body1"
                            sx={{ 
                              fontFamily: 'Share Tech, monospace',
                              color: '#2D3748',
                              fontWeight: 500
                            }}
                          >
                            {profile.role.hospitalName}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {profile.role?.centerName && (
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ 
                            fontFamily: 'Share Tech, monospace',
                            mb: 0.5,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Centre de Don
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            backgroundColor: 'rgba(16, 185, 129, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          <Business sx={{ color: '#10b981', fontSize: 20 }} />
                          <Typography 
                            variant="body1"
                            sx={{ 
                              fontFamily: 'Share Tech, monospace',
                              color: '#2D3748',
                              fontWeight: 500
                            }}
                          >
                            {profile.role.centerName}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                  </Stack>
                </CardContent>
              </Card>
            </Fade>

            {profile.role?.admin && (
              <Fade in timeout={1400}>
                <Card 
                  elevation={0}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '24px',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'Share Tech, monospace',
                        color: '#2D3748',
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <LocationOn sx={{ color: '#008EFF' }} />
                      Coordonnées {profile.role.type === 'hospital_admin' ? 'de l\'hôpital' : 'du centre'}
                    </Typography>
                    
                    <Stack spacing={3}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2
                        }}
                      >
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                          <TextField
                            label="Latitude"
                            value={coordinatesData.latitude}
                            onChange={handleCoordinatesChange('latitude')}
                            disabled={!isEditingCoordinates}
                            fullWidth
                            type="number"
                            placeholder="Ex: 47.2383569"
                            variant="outlined"
                            slotProps={{
                              input: {
                                step: "any",
                                startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                                sx: {
                                  borderRadius: '12px',
                                  backgroundColor: isEditingCoordinates ? 'rgba(0, 142, 255, 0.05)' : 'rgba(0,0,0,0.02)'
                                }
                              } as any,
                              inputLabel: {
                                sx: { fontFamily: 'Share Tech, monospace' }
                              }
                            }}
                            sx={{
                              '& .MuiInputBase-input': {
                                fontFamily: 'Share Tech, monospace'
                              },
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                          <TextField
                            label="Longitude"
                            value={coordinatesData.longitude}
                            onChange={handleCoordinatesChange('longitude')}
                            disabled={!isEditingCoordinates}
                            fullWidth
                            type="number"
                            placeholder="Ex: -1.5603531"
                            variant="outlined"
                            slotProps={{
                              input: {
                                step: "any",
                                startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                                sx: {
                                  borderRadius: '12px',
                                  backgroundColor: isEditingCoordinates ? 'rgba(0, 142, 255, 0.05)' : 'rgba(0,0,0,0.02)'
                                }
                              } as any,
                              inputLabel: {
                                sx: { fontFamily: 'Share Tech, monospace' }
                              }
                            }}
                            sx={{
                              '& .MuiInputBase-input': {
                                fontFamily: 'Share Tech, monospace'
                              },
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        {!isEditingCoordinates ? (
                          <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => setIsEditingCoordinates(true)}
                            sx={{ 
                              color: '#008EFF',
                              borderColor: '#008EFF',
                              '&:hover': { 
                                borderColor: '#0066cc', 
                                color: '#0066cc',
                                backgroundColor: 'rgba(0, 142, 255, 0.05)',
                                transform: 'translateY(-2px)'
                              },
                              fontFamily: 'Share Tech, monospace',
                              borderRadius: '12px',
                              px: 3,
                              py: 1,
                              transition: 'all 0.2s ease-in-out',
                              textTransform: 'none'
                            }}
                          >
                            Modifier coordonnées
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outlined"
                              startIcon={<Cancel />}
                              onClick={handleCancelCoordinates}
                              disabled={profileStore.isUpdatingCoordinates}
                              sx={{ 
                                fontFamily: 'Share Tech, monospace',
                                borderRadius: '12px',
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                color: '#6B7280',
                                borderColor: '#D1D5DB',
                                '&:hover': {
                                  borderColor: '#9CA3AF',
                                  backgroundColor: 'rgba(107, 114, 128, 0.05)'
                                }
                              }}
                            >
                              Annuler
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={profileStore.isUpdatingCoordinates ? <CircularProgress size={16} color="inherit" /> : <Save />}
                              onClick={handleCoordinatesSubmit}
                              disabled={profileStore.isUpdatingCoordinates}
                              sx={{ 
                                bgcolor: '#10b981',
                                '&:hover': { 
                                  bgcolor: '#059669',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                                },
                                fontFamily: 'Share Tech, monospace',
                                borderRadius: '12px',
                                px: 3,
                                py: 1,
                                transition: 'all 0.2s ease-in-out',
                                textTransform: 'none'
                              }}
                            >
                              {profileStore.isUpdatingCoordinates ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            )}
          </Stack>
        </Box>
      </Box>

      {/*  changer pwd */}
      <Dialog 
        open={showPasswordDialog} 
        onClose={handleCancelPassword}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            fontFamily: 'Share Tech, monospace',
            background: 'linear-gradient(45deg, #008EFF, #0066cc)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <VpnKey />
          Changer le mot de passe
          <IconButton
            onClick={handleCancelPassword}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handlePasswordSubmit}>
          <DialogContent sx={{ p: 4 }}>
            {profileStore.error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  '& .MuiAlert-message': {
                    fontFamily: 'Share Tech, monospace'
                  }
                }}
              >
                {profileStore.error}
              </Alert>
            )}
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Mot de passe actuel"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                required
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                        sx={{ color: '#008EFF' }}
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                    sx: {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(0, 142, 255, 0.02)'
                    }
                  },
                  inputLabel: {
                    sx: { fontFamily: 'Share Tech, monospace' }
                  }
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'Share Tech, monospace'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                required
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword || "Au moins 8 caractères, 1 majuscule et 1 chiffre"}
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <VpnKey sx={{ mr: 1, color: 'action.active' }} />,
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                        sx={{ color: '#008EFF' }}
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                    sx: {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(0, 142, 255, 0.02)'
                    }
                  },
                  inputLabel: {
                    sx: { fontFamily: 'Share Tech, monospace' }
                  },
                  formHelperText: {
                    sx: { fontFamily: 'Share Tech, monospace' }
                  }
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'Share Tech, monospace'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Confirmer le nouveau mot de passe"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                required
                error={!!passwordErrors.match}
                helperText={passwordErrors.match}
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <VpnKey sx={{ mr: 1, color: 'action.active' }} />,
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                        sx={{ color: '#008EFF' }}
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                    sx: {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(0, 142, 255, 0.02)'
                    }
                  },
                  inputLabel: {
                    sx: { fontFamily: 'Share Tech, monospace' }
                  },
                  formHelperText: {
                    sx: { fontFamily: 'Share Tech, monospace' }
                  }
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'Share Tech, monospace'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={handleCancelPassword}
              disabled={profileStore.isChangingPassword}
              variant="outlined"
              sx={{ 
                fontFamily: 'Share Tech, monospace',
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                color: '#6B7280',
                borderColor: '#D1D5DB'
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={profileStore.isChangingPassword || !isPasswordFormValid()}
              startIcon={profileStore.isChangingPassword ? <CircularProgress size={16} color="inherit" /> : <Save />}
              sx={{ 
                bgcolor: '#008EFF',
                '&:hover': { 
                  bgcolor: '#0066cc',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 142, 255, 0.3)'
                },
                fontFamily: 'Share Tech, monospace',
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                transition: 'all 0.2s ease-in-out',
                textTransform: 'none'
              }}
            >
              {profileStore.isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar pour les messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success"
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            '& .MuiAlert-message': {
              fontFamily: 'Share Tech, monospace',
              fontWeight: 500
            },
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default ProfileManagement;