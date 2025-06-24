import { Navigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  redirectPath?: string;
}

const PrivateRoute = observer(({ redirectPath = '/login' }: PrivateRouteProps) => {
  const auth = useAuth();
  
  if (!auth.isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <Outlet />;
});

export default PrivateRoute;