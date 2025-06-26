import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminInviteForm from '../components/AdminInviteForm';

const AdminDashboardPage = observer(() => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invite-donation' | 'invite-hospital'>('dashboard');

  useEffect(() => {
    if (!auth.user || auth.user.email !== 'admin@bloodsky.fr') {
      navigate('/dashboard');
    } else {
      setIsAdmin(true);
    }
  }, [auth.user, navigate]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-center mb-10">
          <img src="/blood-drop.svg" alt="BloodSky Logo" className="w-12 h-12 mr-4 logo-animation" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-red-600 iceland-font">
            Administration
          </h1>
        </div>

        {/* NavTabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tableau de bord
              </button>
              <button
                onClick={() => setActiveTab('invite-donation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invite-donation'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inviter Admin Centre
              </button>
              <button
                onClick={() => setActiveTab('invite-hospital')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invite-hospital'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inviter Admin Hôpital
              </button>
            </nav>
          </div>
        </div>

        {/* contenu basé sur le tab */}
        {activeTab === 'dashboard' && (
          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 share-tech-font">
              Bienvenue, {auth.user?.userFirstname}!
            </h2>
            <p className="mb-8 text-lg share-tech-font">
              Vous êtes connecté en tant qu'administrateur du système BloodSky.
            </p>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 className="text-xl font-semibold mb-3 share-tech-font text-red-700">Drones</h3>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-gray-600">Total des drones dans le système</p>
              </div>

              <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 className="text-xl font-semibold mb-3 share-tech-font text-red-700">Livraisons</h3>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-gray-600">Livraisons en cours</p>
              </div>

              <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 className="text-xl font-semibold mb-3 share-tech-font text-red-700">Utilisateurs</h3>
                <p className="text-3xl font-bold">1</p>
                <p className="text-sm text-gray-600">Utilisateurs actifs</p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h3 className="text-xl font-semibold mb-6 share-tech-font">Actions rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
                  Gérer les drones
                </button>
                <button className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
                  Gérer les livraisons
                </button>
                <button className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
                  Gérer les utilisateurs
                </button>
                <button className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
                  Voir les statistiques
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invite-donation' && (
          <AdminInviteForm type="donation_center" />
        )}

        {activeTab === 'invite-hospital' && (
          <AdminInviteForm type="hospital" />
        )}

        {/* Déconnexion */}
        <div className="flex justify-center">
          <button
            onClick={() => auth.logout()}
            className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 share-tech-font font-bold"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
});

export default AdminDashboardPage;