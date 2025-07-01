import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import LoginForm from '../components/LoginForm';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = observer(() => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/home');
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div className="page-container">
      <div className="w-full max-w-lg px-4">
        <div className="mb-12 flex flex-col items-center">
          <img src="/blood-drop.svg" alt="BloodSky Logo" className="w-20 h-20 mb-6 logo-animation" />
          <h1 className="page-title">BloodSky</h1>
          <h2 className="page-subtitle">
            Sign in to your account
          </h2>
          <p className="text-center text-gray-600 share-tech-font mb-8">
            Or{' '}
            <a
              href="/register"
              className="link"
            >
              create a new account
            </a>
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
});

export default LoginPage;