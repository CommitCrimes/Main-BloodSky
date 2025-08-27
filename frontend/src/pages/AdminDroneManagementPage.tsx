import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDroneManagement from '@/components/AdminDroneManagement';

const AdminDroneManagementPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.user?.role?.type !== 'super_admin') {
      navigate('/dashboard');
    }
  }, [auth.user, navigate]);

  return <AdminDroneManagement />;
};

export default AdminDroneManagementPage;