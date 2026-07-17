import { api } from './client';
import type { AuthResponse, UserSummary } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  me: () => api.get<UserSummary>('/auth/me'),
};
