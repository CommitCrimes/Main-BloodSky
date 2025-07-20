import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import AuthProvider from './components/AuthProvider';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HospitalDashboard from './pages/HospitalDashboard';
import DonationCenterDashboard from './pages/DonationCenterDashboard';
import DronistDashboard from './pages/DronistDashboard';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import HomePage from './pages/HomePage';
import './App.css';

const App = observer(() => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Page d'accueil publique - redirige vers login */}
          <Route path="/" element={<HomePage />} />
          
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          
          {/* Routes protégées */}
          <Route element={<PrivateRoute />}>
            {/* Route de redirection basée sur le rôle pour utilisateurs connectés */}
            <Route path="/home" element={<RoleBasedRedirect />} />
          </Route>
          
          {/* Routes protégées par rôle */}
          <Route element={<RoleProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
          
          <Route element={<RoleProtectedRoute allowedRoles={['hospital_admin']} />}>
            <Route path="/hospital" element={<HospitalDashboard />} />
          </Route>
          
          <Route element={<RoleProtectedRoute allowedRoles={['donation_center_admin']} />}>
            <Route path="/donation-center" element={<DonationCenterDashboard />} />
          </Route>
          
          <Route element={<RoleProtectedRoute allowedRoles={['dronist']} />}>
            <Route path="/dronist" element={<DronistDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
});

export default App;