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
  redirectPath = '/dashboard' 
}: RoleProtectedRouteProps) => {
  const auth = useAuth();
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!auth.user?.role) {
    return <div>Chargement...</div>;
  }
  
  if (!allowedRoles.includes(auth.user.role.type)) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <Outlet />;
});

export default RoleProtectedRoute;