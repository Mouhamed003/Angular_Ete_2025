export interface Like {
  id: number;
  post_id?: number;
  comment_id?: number;
  user_id: number;
  nom: string;
  prenom: string;
  photo_profil?: string;
  date_creation: string;
}

export interface LikeResponse {
  message: string;
  action: 'like' | 'unlike';
  total_likes: number;
}
