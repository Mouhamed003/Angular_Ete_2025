import { Component, OnInit } from '@angular/core';
import { PostsService } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/social.models';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
  posts: any[] = [];
  newPostContent = '';
  loading = false;
  error = '';

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.postsService.getAllPosts().subscribe(
      (data) => {
        this.posts = data;
        this.loading = false;
      },
      (error) => {
        this.error = error.error?.message || error.message || 'Erreur lors du chargement des posts';
        this.loading = false;
      }
    );
  }

  createPost() {
    if (!this.newPostContent.trim()) return;

    this.loading = true;
    this.postsService.createPost(this.newPostContent).subscribe(
      (response) => {
        this.newPostContent = '';
        this.loadPosts();
      },
      (error) => {
        this.error = error.error?.message || error.message || 'Erreur lors du chargement des posts';
        this.loading = false;
      }
    );
  }

  deletePost(postId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) return;

    this.loading = true;
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.loadPosts();
      },
      (error) => {
        this.error = error.error?.message || error.message || 'Erreur lors du chargement des posts';
        this.loading = false;
      }
    );
  }
}
