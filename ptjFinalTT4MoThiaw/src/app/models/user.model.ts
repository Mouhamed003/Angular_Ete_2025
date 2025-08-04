export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  bio?: string;
  photo_profil?: string;
  date_creation: string;
  date_modification?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface RegisterRequest {
  email: string;
  mot_de_passe: string;
  nom: string;
  prenom: string;
  bio?: string;
}
