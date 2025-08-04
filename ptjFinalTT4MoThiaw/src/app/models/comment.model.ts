export interface Comment {
  id: number;
  contenu: string;
  post_id: number;
  user_id: number;
  nom: string;
  prenom: string;
  photo_profil?: string;
  nombre_likes: number;
  user_a_like: boolean;
  date_creation: string;
  date_modification?: string;
}

export interface CreateCommentRequest {
  contenu: string;
  post_id: number;
}

export interface UpdateCommentRequest {
  contenu: string;
}
