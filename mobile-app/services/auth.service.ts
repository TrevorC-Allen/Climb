import api from './api';
import { LoginResponse, User } from '../types';

export const authService = {
  async register(email: string, password: string, name?: string) {
    const response = await api.post<LoginResponse>('/users/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post<LoginResponse>('/users/login', {
      email,
      password,
    });
    return response.data;
  },

  async getProfile() {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },
};
