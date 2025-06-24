import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

const RegisterPage = observer(() => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div className="page-container">
      <div className="w-full max-w-lg px-4">
        <div className="mb-12 flex flex-col items-center">
          <img src="/blood-drop.svg" alt="BloodSky Logo" className="w-20 h-20 mb-6 logo-animation" />
          <h1 className="page-title">BloodSky</h1>
          <h2 className="page-subtitle">
            Create a new account
          </h2>
          <p className="text-center text-gray-600 share-tech-font mb-8">
            Or{' '}
            <a
              href="/login"
              className="link"
            >
              sign in to your existing account
            </a>
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
});

export default RegisterPage;