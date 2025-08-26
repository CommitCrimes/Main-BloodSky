import { useContext } from 'react';
import { AuthContext } from '../stores/authContext';
import type { AuthStore } from '../stores/authStore';

/**
 * Hook personnalisé pour utiliser le store d'authentification
 */
export function useAuth(): AuthStore {
  return useContext(AuthContext);
}