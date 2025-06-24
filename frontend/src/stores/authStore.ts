import { authApi, type LoginRequest, type RegisterRequest } from '@/api/auth';
import { makeAutoObservable } from 'mobx';
import { AxiosError } from 'axios';

interface User {
  userId: string;
  email: string;
  userName: string;
  userFirstname: string;
}

class AuthStore {
  user: User | null = null;
  token: string | null = null;
  isAuthenticated = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initFromStorage();
  }

  initFromStorage() {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        this.user = JSON.parse(storedUser);
        this.token = storedToken;
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Failed to initialize auth state from storage', error);
      this.logout();
    }
  }

  async login(credentials: LoginRequest) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await authApi.login(credentials);
      this.user = response.user;
      this.token = response.token;
      this.isAuthenticated = true;
      
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      this.error = axiosError.response?.data?.message || 'Failed to login';
      console.error('Login error', axiosError);
    } finally {
      this.isLoading = false;
    }
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
      this.error = axiosError.response?.data?.message || 'Failed to register';
      console.error('Registration error', axiosError);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.user = null;
    this.token = null;
    this.isAuthenticated = false;
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    window.location.href = '/login';
  }
}

const authStore = new AuthStore();
export default authStore;