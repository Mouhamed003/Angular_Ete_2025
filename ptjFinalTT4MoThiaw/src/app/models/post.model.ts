export interface Post {
  id: number;
  contenu: string;
  image?: string;
  user_id: number;
  nom: string;
  prenom: string;
  photo_profil?: string;
  nombre_likes: number;
  nombre_commentaires: number;
  user_a_like: boolean;
  date_creation: string;
  date_modification?: string;
}

export interface CreatePostRequest {
  contenu: string;
  image?: string;
}

export interface UpdatePostRequest {
  contenu: string;
  image?: string;
}
