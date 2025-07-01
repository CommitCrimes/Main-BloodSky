import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../hooks/useAuth';

const RoleBasedRedirect = observer(() => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.role) {
      const role = auth.user.role;
      
      switch (role.type) {
        case 'super_admin':
          navigate('/admin', { replace: true });
          break;
        case 'hospital_admin':
          navigate('/hospital', { replace: true });
          break;
        case 'donation_center_admin':
          navigate('/donation-center', { replace: true });
          break;
        case 'user':
        default:
          navigate('/dashboard', { replace: true });
          break;
      }
    } else if (!auth.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [auth.isAuthenticated, auth.user?.role, navigate]);

  return <div>Redirection en cours...</div>;
});

export default RoleBasedRedirect;