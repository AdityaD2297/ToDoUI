export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
}
