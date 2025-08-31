import { Navigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '@/types/users';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole['type'][];
  redirectPath?: string;
}

const RoleProtectedRoute = observer(({ 
  allowedRoles, 
  redirectPath = '/home' 
}: RoleProtectedRouteProps) => {
  const auth = useAuth();
  const location = window.location.pathname;
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!auth.user?.role) {
    return <div>Chargement...</div>;
  }
  
  const userRole = auth.user.role;
  
  if (userRole.type === 'user') {
    if (location === '/hospital' && !userRole.hospitalId) {
      return <Navigate to="/home" replace />;
    }
    if (location === '/donation-center' && !userRole.centerId) {
      return <Navigate to="/home" replace />;
    }
  }
  
  if (!allowedRoles.includes(userRole.type)) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <Outlet />;
});

export default RoleProtectedRoute;