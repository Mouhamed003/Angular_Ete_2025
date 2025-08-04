import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, CreatePostRequest, UpdatePostRequest } from '../models/post.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly API_URL = 'http://localhost:3000/api/posts';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Créer une publication
  createPost(postData: CreatePostRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${this.API_URL}`, postData, { headers });
  }

  // Obtenir toutes les publications (fil d'actualité)
  getPosts(page: number = 1, limit: number = 10): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}?page=${page}&limit=${limit}`, { headers });
  }

  // Obtenir une publication spécifique
  getPost(id: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/${id}`, { headers });
  }

  // Obtenir les publications d'un utilisateur
  getUserPosts(userId: number, page: number = 1, limit: number = 10): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/utilisateur/${userId}?page=${page}&limit=${limit}`, { headers });
  }

  // Modifier une publication
  updatePost(id: number, postData: UpdatePostRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(`${this.API_URL}/${id}`, postData, { headers });
  }

  // Supprimer une publication
  deletePost(id: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/${id}`, { headers });
  }
}
