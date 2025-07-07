import { authApi, type LoginRequest, type RegisterRequest } from '@/api/auth';
import { userProfileApi, type UserRole } from '@/api/userProfile';
import { makeAutoObservable } from 'mobx';
import { AxiosError } from 'axios';

interface User {
  userId: string;
  email: string;
  userName: string;
  userFirstname: string;
}

interface UserWithRole extends User {
  role?: UserRole;
}

class AuthStore {
  user: UserWithRole | null = null;
  token: string | null = null;
  isAuthenticated = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initFromStorage();
  }

  async initFromStorage() {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        this.user = JSON.parse(storedUser);
        this.token = storedToken;
        this.isAuthenticated = true;
        
        if (this.user && !this.user.role) {
          try {
            if (this.user.email === 'admin@bloodsky.fr') {
              this.user.role = { type: 'super_admin' };
              console.log('Super admin détecté par email lors de l\'initialisation:', this.user.email);
            } else {
              const role = await userProfileApi.getUserRole({
                userId: this.user.userId,
                email: this.user.email
              });
              this.user.role = role;
            }
            localStorage.setItem('user', JSON.stringify(this.user));
          } catch (error) {
            console.error('Impossible de récupérer le rôle utilisateur:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth state from storage', error);
      this.logout();
    }
  }

  async login(credentials: LoginRequest) {
    console.log('AuthStore - Début du login avec:', credentials.email);
    this.isLoading = true;
    this.error = null;
    
    try {
      console.log('AuthStore - Appel de l\'API login...');
      const response = await authApi.login(credentials);
      console.log('AuthStore - Réponse API login:', response);
      const user: UserWithRole = { ...response.user };
      
      this.token = response.token;
      localStorage.setItem('token', response.token);
      console.log('AuthStore - Token stocké');
      
      if (user.email === 'admin@bloodsky.fr') {
        user.role = { type: 'super_admin' };
        console.log('AuthStore - Super admin détecté par email:', user.email);
      } else {
        try {
          console.log('AuthStore - Détermination du rôle pour userId:', user.userId);
          const role = await userProfileApi.getUserRole({
            userId: user.userId,
            email: user.email
          });
          user.role = role;
          console.log('AuthStore - Rôle utilisateur déterminé:', role);
        } catch (roleError) {
          console.error('AuthStore - Impossible de déterminer le rôle utilisateur:', roleError);
          throw new Error('Impossible de déterminer vos permissions. Veuillez contacter l\'administrateur.');
        }
      }
      
      console.log('AuthStore - User final avec rôle:', user);
      this.user = user;
      this.isAuthenticated = true;
      console.log('AuthStore - isAuthenticated défini à true');
      alert('LOGIN RÉUSSI - Rôle: ' + JSON.stringify(user.role));
      
      localStorage.setItem('user', JSON.stringify(user));
      console.log('AuthStore - User stocké dans localStorage');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to login';
      console.error('AuthStore - Login error:', errorMessage);
      this.setError(errorMessage);
    } finally {
      this.isLoading = false;
      console.log('AuthStore - isLoading défini à false');
    }
  }

  setError(message: string) {
    this.error = message;
  }

  async register(userData: RegisterRequest) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await authApi.register(userData);
      this.user = response.user;
      this.token = response.token;
      this.isAuthenticated = true;
      
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to register';
      console.error('Registration error', errorMessage);
      this.setError(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    console.trace('AuthStore - logout() appelé depuis:');
    console.log('AuthStore - Déconnexion en cours...');
    this.user = null;
    this.token = null;
    this.isAuthenticated = false;
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    console.log('AuthStore - Redirection vers /login');
    window.location.href = '/login';
  }
}

const authStore = new AuthStore();
export default authStore;