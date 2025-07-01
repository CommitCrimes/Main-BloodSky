import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import AuthProvider from './components/AuthProvider';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import PrivateRoute from './components/PrivateRoute';
import SearchBar from './components/SearchBar';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage';
import './App.css';

const App = observer(() => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          <Route path="/search" element={<SuperAdminDashboardPage/>}></Route>
          
          {/* Routes protégées */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            {/* Ajouter d'autres routes protégées ici */}
          </Route>
          
          {/* Redirection */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
});

export default App;