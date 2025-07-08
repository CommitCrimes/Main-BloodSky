import { useEffect, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import authStore from '../stores/authStore';
import { AuthContext } from '../stores/authContext';
import { ProfileContext } from '../stores/profileContext';
import { profileStore } from '../stores/profileStore';

const AuthProvider = observer(({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.log('Token expiré, déconnexion...');
          authStore.logout();
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'expiration du token:', error);
        authStore.logout();
      }
    }
  }, []);
  
  return (
    <AuthContext.Provider value={authStore}>
      <ProfileContext.Provider value={profileStore}>
        {children}
      </ProfileContext.Provider>
    </AuthContext.Provider>
  );
});

export default AuthProvider;