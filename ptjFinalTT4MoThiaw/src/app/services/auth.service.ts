import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'reseau_social_token';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserFromToken();
  }

  // Inscription
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/inscription`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  // Connexion
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/connexion`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  // Déconnexion
  logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.API_URL}/auth/deconnexion`, {}, { headers })
      .pipe(
        tap(() => this.handleLogout())
      );
  }

  // Vérifier le token
  verifyToken(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.API_URL}/auth/verifier`, { headers })
      .pipe(
        tap(response => {
          if (response && (response as any).user) {
            this.currentUserSubject.next((response as any).user);
          }
        })
      );
  }

  // Gérer le succès de l'authentification
  private handleAuthSuccess(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
    }
    this.currentUserSubject.next(response.user);
  }

  // Gérer la déconnexion
  private handleLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUserSubject.next(null);
  }

  // Charger l'utilisateur depuis le token stocké
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.verifyToken().subscribe({
        next: () => {
          // L'utilisateur est déjà défini dans verifyToken
        },
        error: () => {
          // Token invalide, nettoyer
          this.handleLogout();
        }
      });
    }
  }

  // Obtenir le token
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // Obtenir les en-têtes d'authentification
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Mettre à jour l'utilisateur actuel
  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
}
