import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '../components/LoginForm';

const LoginPage = observer(() => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/home');
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 medical-gradient cyber-grid">
      <LoginForm />
    </div>
  );
});

export default LoginPage;