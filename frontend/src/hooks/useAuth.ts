import { useContext } from 'react';
import { AuthContext } from '../stores/authContext';

/**
 * Hook personnalisé pour utiliser le store d'authentification
 */
export function useAuth() {
  return useContext(AuthContext);
}