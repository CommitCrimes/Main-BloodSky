import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../hooks/useAuth';

const RoleBasedRedirect = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (hasRedirected) return;

    if (auth.isAuthenticated && auth.user?.role) {
      const role = auth.user.role;
      let targetPath = '';
      
      switch (role.type) {
        case 'super_admin':
          targetPath = '/admin';
          break;
        case 'hospital_admin':
          targetPath = '/hospital';
          break;
        case 'donation_center_admin':
          targetPath = '/donation-center';
          break;
        case 'dronist':
          targetPath = '/dronist';
          break;
        case 'user':
          console.log('Utilisateur sans rôle spécialisé:', role);
          targetPath = '/login';
          break;
        default:
          console.log('Role utilisateur non reconnu:', role);
          auth.logout();
          targetPath = '/login';
          break;
      }

      if (location.pathname !== targetPath) {
        setHasRedirected(true);
        navigate(targetPath, { replace: true });
      }
    } else if (!auth.isAuthenticated) {
      if (location.pathname !== '/login') {
        setHasRedirected(true);
        navigate('/login', { replace: true });
      }
    }
  }, [auth.isAuthenticated, auth.user?.role, navigate, location.pathname, hasRedirected, auth]);

  return <div>Redirection en cours...</div>;
});

export default RoleBasedRedirect;