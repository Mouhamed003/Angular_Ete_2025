import { Routes } from '@angular/router';

import { LoginComponent } from './components/auth/login/login.component';
import { PostsComponent } from './components/posts/posts.component';

export const routes: Routes = [
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'posts', component: PostsComponent },
  // Ajoute d'autres routes ici si besoin (register, profil, etc.)
];
