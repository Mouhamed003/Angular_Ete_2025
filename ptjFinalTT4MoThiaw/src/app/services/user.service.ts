import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/api/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtenir son profil
  getProfile(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/profil`, { headers });
  }

  // Obtenir un profil par ID
  getUserById(id: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}/${id}`, { headers });
  }

  // Mettre à jour son profil
  updateProfile(userData: Partial<User>): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(`${this.API_URL}/profil`, userData, { headers });
  }

  // Changer son mot de passe
  changePassword(passwordData: { ancien_mot_de_passe: string, nouveau_mot_de_passe: string }): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(`${this.API_URL}/mot-de-passe`, passwordData, { headers });
  }

  // Supprimer son compte
  deleteAccount(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/profil`, { headers });
  }

  // Lister tous les utilisateurs
  getAllUsers(page: number = 1, limit: number = 10): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.API_URL}?page=${page}&limit=${limit}`, { headers });
  }
}
