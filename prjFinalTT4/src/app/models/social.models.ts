export interface User {
  id: number;
  username: string;
  email: string;
  token?: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at?: string;
  username?: string; // pour affichage enrichi
}

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at?: string;
  username?: string;
}

export interface Like {
  id: number;
  user_id: number;
  post_id: number;
}
