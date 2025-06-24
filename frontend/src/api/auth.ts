import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userName: string;
  userFirstname: string;
  telNumber?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    userId: string;
    email: string;
    userName: string;
    userFirstname: string;
  };
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};

export default authApi;