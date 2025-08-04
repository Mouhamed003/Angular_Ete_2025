import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../models/comment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly API_URL = 'http://localhost:3000/api/comments';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Créer un commentaire
  createComment(commentData: CreateCommentRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${this.API_URL}`, commentData, { headers });
  }

  // Obtenir les commentaires d'une publication
  getPostComments(postId: number, page: number = 1, limit: number = 20): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/publication/${postId}?page=${page}&limit=${limit}`, { headers });
  }

  // Obtenir un commentaire spécifique
  getComment(id: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/${id}`, { headers });
  }

  // Obtenir les commentaires d'un utilisateur
  getUserComments(userId: number, page: number = 1, limit: number = 10): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/utilisateur/${userId}?page=${page}&limit=${limit}`, { headers });
  }

  // Modifier un commentaire
  updateComment(id: number, commentData: UpdateCommentRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(`${this.API_URL}/${id}`, commentData, { headers });
  }

  // Supprimer un commentaire
  deleteComment(id: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/${id}`, { headers });
  }
}
