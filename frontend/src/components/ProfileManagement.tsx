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
  Snackbar
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
  Close 
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
    <Box p={3}>
      <Typography 
        variant="h1" 
        gutterBottom 
        sx={{ 
          color: '#981A0E', 
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
          fontFamily: 'Iceland, cursive',
          mb: 1 
        }}
      >
        Mon Profil
      </Typography>

      {profileStore.error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => profileStore.clearError()}>
          {profileStore.error}
        </Alert>
      )}

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3 
        }}
      >
        {/* Infos perso */}
        <Box sx={{ flex: { md: 2 } }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: '#981A0E', mr: 2, width: 56, height: 56 }}>
                  <Person fontSize="large" />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6"
                    sx={{ fontFamily: 'Share Tech, monospace' }}
                  >
                    {profile.userFirstname} {profile.userName}
                  </Typography>
                  <Chip
                    label={getRoleDisplayName(profile.role?.type)}
                    color={getRoleColor(profile.role?.type)}
                    size="small"
                    icon={<AdminPanelSettings />}
                    sx={{ fontFamily: 'Share Tech, monospace' }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: 3 
                  }}
                >
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={formData.userFirstname}
                    onChange={handleInputChange('userFirstname')}
                    disabled={!isEditing}
                    slotProps={{
                      input: {
                        startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                        readOnly: !isEditing
                      },
                      inputLabel: {
                        sx: { fontFamily: 'Share Tech, monospace' }
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'Share Tech, monospace'
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Nom"
                    value={formData.userName}
                    onChange={handleInputChange('userName')}
                    disabled={!isEditing}
                    slotProps={{
                      input: {
                        startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                        readOnly: !isEditing
                      },
                      inputLabel: {
                        sx: { fontFamily: 'Share Tech, monospace' }
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'Share Tech, monospace'
                      }
                    }}
                  />
                </Box>

                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: 3 
                  }}
                >
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    disabled
                    slotProps={{
                      input: {
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                        readOnly: true
                      },
                      inputLabel: {
                        sx: { fontFamily: 'Share Tech, monospace' }
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'Share Tech, monospace'
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Téléphone"
                    type="tel"
                    value={formData.telNumber || ''}
                    onChange={handleInputChange('telNumber')}
                    disabled={!isEditing}
                    slotProps={{
                      input: {
                        startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                        readOnly: !isEditing
                      },
                      inputLabel: {
                        sx: { fontFamily: 'Share Tech, monospace' }
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'Share Tech, monospace'
                      }
                    }}
                  />
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
                    slotProps={{
                      input: {
                        startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />,
                        readOnly: !isEditing
                      },
                      inputLabel: {
                        sx: { fontFamily: 'Share Tech, monospace' }
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'Share Tech, monospace'
                      }
                    }}
                  />
                )}
              </Box>

              <Box mt={3} display="flex" gap={2} flexWrap="wrap">
                {!isEditing ? (
                  <>
                    <Button
                      variant="contained"
                      onClick={() => setIsEditing(true)}
                      sx={{ 
                        bgcolor: '#008EFF',
                        '&:hover': { bgcolor: '#0066cc' },
                        fontFamily: 'Share Tech, monospace'
                      }}
                    >
                      Modifier le profil
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setShowPasswordDialog(true)}
                      startIcon={<Lock />}
                      sx={{ 
                        color: '#008EFF',
                        borderColor: '#008EFF',
                        '&:hover': { borderColor: '#0066cc', color: '#0066cc' },
                        fontFamily: 'Share Tech, monospace'
                      }}
                    >
                      Changer le mot de passe
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={profileStore.isUpdating}
                      sx={{ 
                        bgcolor: '#008EFF',
                        '&:hover': { bgcolor: '#0066cc' },
                        fontFamily: 'Share Tech, monospace'
                      }}
                    >
                      {profileStore.isUpdating ? <CircularProgress size={20} /> : 'Enregistrer'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={profileStore.isUpdating}
                      sx={{ fontFamily: 'Share Tech, monospace' }}
                    >
                      Annuler
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* info du compte */}
        <Box sx={{ flex: { md: 1 } }}>
          <Card>
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontFamily: 'Share Tech, monospace' }}
              >
                Informations du compte
              </Typography>
              <Divider sx={{ mb: 2 }} />
              

              {profile.dteCreate && (
                <Box mb={2}>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{ fontFamily: 'Share Tech, monospace' }}
                  >
                    Membre depuis
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ fontFamily: 'Share Tech, monospace' }}
                  >
                    {new Date(profile.dteCreate).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              )}

              {profile.role?.hospitalName && (
                <Box mb={2}>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{ fontFamily: 'Share Tech, monospace' }}
                  >
                    Hôpital
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ fontFamily: 'Share Tech, monospace' }}
                  >
                    {profile.role.hospitalName}
                  </Typography>
                </Box>
              )}

              {profile.role?.centerName && (
                <Box mb={2}>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{ fontFamily: 'Share Tech, monospace' }}
                  >
                    Centre de Don
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ fontFamily: 'Share Tech, monospace' }}
                  >
                    {profile.role.centerName}
                  </Typography>
                </Box>
              )}

              {/* seulement adminnnn */}
              {profile.role?.admin && (
                <Box mb={2}>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{ fontFamily: 'Share Tech, monospace', mb: 1 }}
                  >
                    Coordonnées {profile.role.type === 'hospital_admin' ? 'de l\'hôpital' : 'du centre'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Latitude"
                        value={coordinatesData.latitude}
                        onChange={handleCoordinatesChange('latitude')}
                        disabled={!isEditingCoordinates}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Ex: 47.2383569"
                        slotProps={{
                          input: {
                            step: "any"
                          } as any,
                          inputLabel: {
                            sx: { fontFamily: 'Share Tech, monospace' }
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: 'Share Tech, monospace'
                          }
                        }}
                      />
                      <TextField
                        label="Longitude"
                        value={coordinatesData.longitude}
                        onChange={handleCoordinatesChange('longitude')}
                        disabled={!isEditingCoordinates}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Ex: -1.5603531"
                        slotProps={{
                          input: {
                            step: "any"
                          } as any,
                          inputLabel: {
                            sx: { fontFamily: 'Share Tech, monospace' }
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: 'Share Tech, monospace'
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!isEditingCoordinates ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setIsEditingCoordinates(true)}
                          sx={{ 
                            color: '#008EFF',
                            borderColor: '#008EFF',
                            '&:hover': { borderColor: '#0066cc', color: '#0066cc' },
                            fontFamily: 'Share Tech, monospace'
                          }}
                        >
                          Modifier coordonnées
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleCoordinatesSubmit}
                            disabled={profileStore.isUpdatingCoordinates}
                            sx={{ 
                              bgcolor: '#008EFF',
                              '&:hover': { bgcolor: '#0066cc' },
                              fontFamily: 'Share Tech, monospace'
                            }}
                          >
                            {profileStore.isUpdatingCoordinates ? <CircularProgress size={16} /> : 'Enregistrer'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleCancelCoordinates}
                            disabled={profileStore.isUpdatingCoordinates}
                            sx={{ fontFamily: 'Share Tech, monospace' }}
                          >
                            Annuler
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/*  changer pwd */}
      <Dialog 
        open={showPasswordDialog} 
        onClose={handleCancelPassword}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Share Tech, monospace' }}>
          Changer le mot de passe
          <IconButton
            onClick={handleCancelPassword}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handlePasswordSubmit}>
          <DialogContent>
            {profileStore.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {profileStore.error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField
                fullWidth
                label="Mot de passe actuel"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  },
                  inputLabel: {
                    sx: { fontFamily: 'Share Tech, monospace' }
                  }
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'Share Tech, monospace'
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
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
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
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
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
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleCancelPassword}
              disabled={profileStore.isChangingPassword}
              sx={{ fontFamily: 'Share Tech, monospace' }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={profileStore.isChangingPassword || !isPasswordFormValid()}
              sx={{ 
                bgcolor: '#008EFF',
                '&:hover': { bgcolor: '#0066cc' },
                fontFamily: 'Share Tech, monospace'
              }}
            >
              {profileStore.isChangingPassword ? <CircularProgress size={20} /> : 'Changer'}
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
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontFamily: 'Share Tech, monospace'
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