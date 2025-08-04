import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/social.models';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Headers pour les requêtes authentifiées
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).token : '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Créer un nouveau post
  createPost(content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts`, { content }, { headers: this.getHeaders() });
  }

  // Obtenir tous les posts
  getAllPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts`, { headers: this.getHeaders() });
  }

  // Obtenir un post spécifique
  getPost(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts/${id}`, { headers: this.getHeaders() });
  }

  // Mettre à jour un post
  updatePost(id: number, content: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/posts/${id}`, { content }, { headers: this.getHeaders() });
  }

  // Supprimer un post
  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/posts/${id}`, { headers: this.getHeaders() });
  }
}
