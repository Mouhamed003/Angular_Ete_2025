import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
// Vérifiez que le chemin d'import est correct selon votre structure de projet
import { User } from '../../models/social.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Redirige vers /posts si déjà connecté
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/posts']);
    }
  }

  get f(): { [key: string]: any } { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.f.email.value, this.f.password.value)
      .subscribe({
        next: (user: User) => {
          this.error = null;
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          this.error = error.error?.message || error.message || 'Une erreur est survenue lors de la connexion';
          this.loading = false;
        }
      });
  }
}
