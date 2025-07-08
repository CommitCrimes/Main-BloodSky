import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  ThemeProvider,
} from '@mui/material';
import { api } from '../api/api';
import logoImage from '@/assets/logo.png';
import theme from '@/theme/theme';

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const UpdatePasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string>('');
  const [tempPassword, setTempPassword] = useState<string>('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const tempParam = searchParams.get('temp');

    if (!tokenParam || !tempParam) {
      navigate('/login', { replace: true });
      return;
    }

    setToken(tokenParam);
    setTempPassword(tempParam);
  }, [searchParams, navigate]);

  const validatePassword = (password: string): string | undefined => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[0-9]/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: FormErrors = {};

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/update-password', {
        token,
        tempPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      navigate('/login', { 
        replace: true,
        state: { message: 'Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter.' }
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? (error.response.data as { message: string }).message
        : 'Une erreur est survenue lors de la mise à jour du mot de passe';
      setErrors({ 
        general: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#e3f8fe',
          py: 3,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', px: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box
                component="img"
                src={logoImage}
                alt="BloodSky"
                sx={{
                  width: 80,
                  height: 80,
                  mb: 3,
                }}
              />
              <Typography
                variant="h1"
                component="h2"
                sx={{
                  fontSize: '2rem',
                  color: '#981A0E',
                  fontFamily: 'Iceland, cursive',
                  textAlign: 'center',
                  mb: 1,
                }}
              >
                Définir votre mot de passe
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Share Tech, monospace',
                  color: '#5C7F9B',
                  textAlign: 'center',
                  mb: 3,
                  opacity: 0.8,
                }}
              >
                Choisissez un nouveau mot de passe pour votre compte BloodSky
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {errors.general && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.general}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  label="Nouveau mot de passe"
                  placeholder="Entrez votre nouveau mot de passe"
                  required
                  fullWidth
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword || 'Au moins 8 caractères, 1 majuscule et 1 chiffre'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#008EFF',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#008EFF',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#008EFF',
                    },
                  }}
                />

                <TextField
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Confirmer le mot de passe"
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                  fullWidth
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#008EFF',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#008EFF',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#008EFF',
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                disabled={isLoading}
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  backgroundColor: '#008EFF',
                  fontFamily: 'Share Tech, monospace',
                  '&:hover': {
                    backgroundColor: '#0066CC',
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                  },
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Mise à jour...
                  </Box>
                ) : (
                  'Mettre à jour le mot de passe'
                )}
              </Button>

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  color: '#5C7F9B',
                  mt: 2,
                  fontFamily: 'Share Tech, monospace',
                  opacity: 0.7,
                }}
              >
                Problème avec ce lien ? Contactez votre administrateur
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default UpdatePasswordPage;