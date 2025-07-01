import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Box, Typography, Paper, ThemeProvider } from '@mui/material';
import LoginForm from '../components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import logoImage from '@/assets/logo.png';
import theme from '@/theme/theme';

const LoginPage = observer(() => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/home');
    }
  }, [auth.isAuthenticated, navigate]);

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
                alt="BloodSky Logo"
                sx={{
                  width: 120,
                  height: 120,
                  mb: 3,
                }}
              />
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: '2.5rem',
                  color: '#981A0E',
                  fontFamily: 'Iceland, cursive',
                  mb: 1,
                  textAlign: 'center',
                }}
              >
                BloodSky
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  color: '#5C7F9B',
                  fontFamily: 'Share Tech, monospace',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Connectez-vous à votre compte
              </Typography>
            </Box>
            
            <LoginForm />
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
});

export default LoginPage;