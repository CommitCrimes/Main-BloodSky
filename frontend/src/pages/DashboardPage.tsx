import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuth } from '@/hooks/useAuth';

const DashboardPage = observer(() => {
  const auth = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (auth.user && auth.user.email === 'admin@bloodsky.fr') {
      navigate('/admin');
    }
  }, [auth.user, navigate]);
  
  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-center mb-10">
          <img src="/blood-drop.svg" alt="BloodSky Logo" className="w-12 h-12 mr-4 logo-animation" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-red-600 iceland-font">Dashboard</h1>
        </div>
        
        {auth.user && (
          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 share-tech-font">Bienvenue, {auth.user.userFirstname}!</h2>
            <p className="mb-8 text-lg share-tech-font">Vous êtes connecté à votre compte BloodSky.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 className="text-xl font-semibold mb-3 share-tech-font text-red-700">Détails du compte</h3>
                <ul className="space-y-2">
                  <li><strong>Nom:</strong> {auth.user.userFirstname} {auth.user.userName}</li>
                  <li><strong>Email:</strong> {auth.user.email}</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 className="text-xl font-semibold mb-3 share-tech-font text-red-700">Actions rapides</h3>
                <p className="mb-4">Accédez aux paramètres de votre profil et préférences</p>
                <button className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition-colors">
                  Voir le profil
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => auth.logout()}
                className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 share-tech-font font-bold"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default DashboardPage;