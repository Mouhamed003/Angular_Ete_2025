import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LikeResponse } from '../models/like.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private readonly API_URL = 'http://localhost:3000/api/likes';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Liker/Unliker une publication
  togglePostLike(postId: number): Observable<LikeResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<LikeResponse>(`${this.API_URL}/publication/${postId}`, {}, { headers });
  }

  // Liker/Unliker un commentaire
  toggleCommentLike(commentId: number): Observable<LikeResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<LikeResponse>(`${this.API_URL}/commentaire/${commentId}`, {}, { headers });
  }

  // Obtenir les likes d'une publication
  getPostLikes(postId: number, page: number = 1, limit: number = 20): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/publication/${postId}?page=${page}&limit=${limit}`, { headers });
  }

  // Obtenir les likes d'un commentaire
  getCommentLikes(commentId: number, page: number = 1, limit: number = 20): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/commentaire/${commentId}?page=${page}&limit=${limit}`, { headers });
  }

  // Obtenir les activités de like d'un utilisateur
  getUserLikes(userId: number, page: number = 1, limit: number = 10): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/utilisateur/${userId}?page=${page}&limit=${limit}`, { headers });
  }
}
