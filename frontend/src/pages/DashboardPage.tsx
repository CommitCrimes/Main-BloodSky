import { useAuth } from '@/hooks/useAuth';
import { observer } from 'mobx-react-lite';

const DashboardPage = observer(() => {
  const auth = useAuth();
  
  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-center mb-10">
          <img src="/blood-drop.svg" alt="BloodSky Logo" className="w-12 h-12 mr-4 logo-animation" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-red-600 iceland-font">Dashboard</h1>
        </div>
        
        {auth.user && (
          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 share-tech-font">Welcome, {auth.user.userFirstname}!</h2>
            <p className="mb-8 text-lg share-tech-font">You are successfully logged in to your BloodSky account.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 className="text-xl font-semibold mb-3 share-tech-font text-red-700">Account Details</h3>
                <ul className="space-y-2">
                  <li><strong>Name:</strong> {auth.user.userFirstname} {auth.user.userName}</li>
                  <li><strong>Email:</strong> {auth.user.email}</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 className="text-xl font-semibold mb-3 share-tech-font text-red-700">Quick Actions</h3>
                <p className="mb-4">Access your profile settings and account preferences</p>
                <button className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition-colors">
                  View Profile
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => auth.logout()}
                className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 share-tech-font font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default DashboardPage;