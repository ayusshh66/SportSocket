export interface User {
  id: number;
  name: string;
  email: string;
  favoriteSport?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
