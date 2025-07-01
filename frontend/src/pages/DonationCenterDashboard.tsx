import React, { useState } from 'react';
import { Heart, Users, TrendingUp, Calendar, Bell, MapPin, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DonationSession {
  id: string;
  donorName: string;
  bloodType: string;
  quantity: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledTime: string;
}

interface StatsCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const DonationCenterDashboard = () => {
  const auth = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'donations', label: 'Donations' },
    { id: 'donors', label: 'Donneurs' },
    { id: 'calendar', label: 'Planning' },
    { id: 'inventory', label: 'Inventaire' },
    { id: 'notifications', label: 'Notifications', hasNotification: true },
    { id: 'profil', label: 'Mon profil' },
    ...(auth.user?.role?.admin ? [{ id: 'users', label: 'Gestion des utilisateurs' }] : []),
    { id: 'deconnexion', label: 'Déconnexion' }
  ];

  const todayDonations: DonationSession[] = [
    { id: '1', donorName: 'Jean Dupont', bloodType: 'O+', quantity: 450, status: 'completed', scheduledTime: '08:30' },
    { id: '2', donorName: 'Marie Martin', bloodType: 'A-', quantity: 450, status: 'in_progress', scheduledTime: '09:15' },
    { id: '3', donorName: 'Pierre Leroy', bloodType: 'B+', quantity: 450, status: 'scheduled', scheduledTime: '10:00' },
    { id: '4', donorName: 'Sophie Bernard', bloodType: 'AB-', quantity: 450, status: 'scheduled', scheduledTime: '10:30' },
  ];

  const statsCards: StatsCard[] = [
    {
      title: 'Donations Aujourd\'hui',
      value: 12,
      change: 8,
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-500'
    },
    {
      title: 'Donneurs Actifs',
      value: '1,247',
      change: 12,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Collection Mensuelle',
      value: '342L',
      change: 5,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Taux de Présence',
      value: '89%',
      change: -2,
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-purple-500'
    }
  ];

  const bloodTypeDistribution = [
    { type: 'O+', percentage: 38, collected: 125 },
    { type: 'A+', percentage: 28, collected: 92 },
    { type: 'B+', percentage: 15, collected: 49 },
    { type: 'AB+', percentage: 8, collected: 26 },
    { type: 'O-', percentage: 5, collected: 16 },
    { type: 'A-', percentage: 4, collected: 13 },
    { type: 'B-', percentage: 1.5, collected: 5 },
    { type: 'AB-', percentage: 0.5, collected: 2 },
  ];

  const handleMenuClick = (item: { id: string; label: string }) => {
    if (item.id === 'deconnexion') {
      auth.logout();
    } else {
      setActiveView(item.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'scheduled': return 'Programmée';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-600 text-white px-4 py-2 text-sm">
        Centre de Don - Dashboard
      </div>

      <div className="bg-white max-w-7xl mx-auto shadow-lg min-h-screen">
        <div className="bg-gradient-to-r from-red-100 to-pink-50 px-8 py-6">
          <div className="flex items-start gap-6">
            <div className="bg-red-200 rounded-full p-4 relative">
              <div className="w-16 h-16 relative">
                <svg viewBox="0 0 64 64" className="w-full h-full">
                  <path d="M32 8C32 8 16 24 16 36C16 46 23 54 32 54C41 54 48 46 48 36C48 24 32 8 32 8Z" 
                        fill="#dc2626" />
                  <circle cx="26" cy="32" r="2" fill="#fff" />
                  <circle cx="38" cy="32" r="2" fill="#fff" />
                  <path d="M26 38Q32 42 38 38" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <ellipse cx="32" cy="18" rx="8" ry="10" fill="white" opacity="0.6" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-red-800 mb-2">Bienvenue {auth.user?.userFirstname}</h1>
              <p className="text-xl text-gray-700">Centre de Don - Vue d'ensemble</p>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Calendar className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="w-64 bg-gray-50 min-h-screen">
            <nav className="py-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full text-left px-8 py-4 text-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors relative ${
                    activeView === item.id ? 'bg-gray-100 text-gray-800 border-r-4 border-red-500' : ''
                  }`}
                >
                  {item.label}
                  {item.hasNotification && (
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-8">
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {statsCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${stat.color} text-white p-3 rounded-lg`}>
                          {stat.icon}
                        </div>
                        {stat.change && (
                          <span className={`text-sm font-semibold ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stat.change > 0 ? '+' : ''}{stat.change}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Today's Donations */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Donations Aujourd'hui</h2>
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="space-y-3">
                      {todayDonations.map((donation) => (
                        <div key={donation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <p className="font-semibold text-gray-800">{donation.donorName}</p>
                              <p className="text-sm text-gray-600">{donation.scheduledTime}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                              {getStatusLabel(donation.status)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-red-600">{donation.bloodType}</span>
                            <span className="text-sm text-gray-600">{donation.quantity}ml</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Distribution des Groupes</h2>
                      <MapPin className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="space-y-4">
                      {bloodTypeDistribution.map((group) => (
                        <div key={group.type} className="flex items-center gap-3">
                          <span className="font-semibold text-gray-700 w-10">{group.type}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                            <div 
                              className="h-full bg-red-500 rounded-full transition-all duration-500"
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16">{group.collected}L</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Actions Rapides</h2>
                    <div className="space-y-3">
                      <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Heart className="w-5 h-5" />
                        Nouvelle Donation
                      </button>
                      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Users className="w-5 h-5" />
                        Enregistrer Donneur
                      </button>
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Planifier RDV
                      </button>
                      <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Activity className="w-5 h-5" />
                        Rapport Mensuel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Activité Récente</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 pb-3 border-b">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-gray-600">Donation complétée: Jean Dupont (O+) - Il y a 15 min</p>
                    </div>
                    <div className="flex items-center gap-4 pb-3 border-b">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-gray-600">Nouveau donneur enregistré: Marie Durand - Il y a 45 min</p>
                    </div>
                    <div className="flex items-center gap-4 pb-3 border-b">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-gray-600">RDV programmé pour demain: 5 donneurs - Il y a 1h</p>
                    </div>
                  </div>
                </div>
              </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationCenterDashboard;