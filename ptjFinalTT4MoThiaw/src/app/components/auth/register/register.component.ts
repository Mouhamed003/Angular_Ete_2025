import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    email: '',
    mot_de_passe: '',
    nom: '',
    prenom: '',
    bio: ''
  };

  confirmPassword = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Inscription réussie:', response);
        this.router.navigate(['/accueil']);
      },
      error: (error) => {
        console.error('Erreur d\'inscription:', error);
        this.error = error.error?.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private validateForm(): boolean {
    if (!this.registerData.email || !this.registerData.mot_de_passe || 
        !this.registerData.nom || !this.registerData.prenom) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return false;
    }

    if (this.registerData.mot_de_passe !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return false;
    }

    if (this.registerData.mot_de_passe.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return false;
    }

    return true;
  }
}
