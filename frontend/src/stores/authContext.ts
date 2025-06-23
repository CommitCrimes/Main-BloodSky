import { createContext } from 'react';
import authStore from './authStore';

// Créer un contexte pour le store d'authentification
export const AuthContext = createContext(authStore);