import { ReactNode, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import authStore from '../stores/authStore';
import { AuthContext } from '../stores/authContext';

// Composant fournisseur qui rend le store disponible pour tous les enfants
const AuthProvider = observer(({ children }: { children: ReactNode }) => {
  // Vérifier l'expiration du token au montage
  useEffect(() => {
    // Récupérer le token du localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Parser le payload JWT (deuxième partie du token)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Vérifier si le token est expiré
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
      {children}
    </AuthContext.Provider>
  );
});

export default AuthProvider;