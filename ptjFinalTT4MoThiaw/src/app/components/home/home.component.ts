import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { LikeService } from '../../services/like.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Post, CreatePostRequest } from '../../models/post.model';
import { Comment, CreateCommentRequest } from '../../models/comment.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  currentUser: User | null = null;
  loading = false;
  error = '';
  
  // Nouveau post
  newPost: CreatePostRequest = {
    contenu: '',
    image: ''
  };
  isCreatingPost = false;

  // Commentaires
  showComments: { [postId: number]: boolean } = {};
  comments: { [postId: number]: Comment[] } = {};
  newComment: { [postId: number]: string } = {};
  loadingComments: { [postId: number]: boolean } = {};

  constructor(
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = '';

    this.postService.getPosts().subscribe({
      next: (response) => {
        this.posts = response.posts || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des posts:', error);
        this.error = 'Erreur lors du chargement des publications';
        this.loading = false;
      }
    });
  }

  createPost(): void {
    if (!this.newPost.contenu.trim()) {
      return;
    }

    this.isCreatingPost = true;

    this.postService.createPost(this.newPost).subscribe({
      next: (response) => {
        this.posts.unshift(response.post);
        this.newPost = { contenu: '', image: '' };
        this.isCreatingPost = false;
      },
      error: (error) => {
        console.error('Erreur lors de la création du post:', error);
        this.error = 'Erreur lors de la création de la publication';
        this.isCreatingPost = false;
      }
    });
  }

  toggleLike(post: Post): void {
    this.likeService.togglePostLike(post.id).subscribe({
      next: (response) => {
        post.user_a_like = response.action === 'like';
        post.nombre_likes = response.total_likes;
      },
      error: (error) => {
        console.error('Erreur lors du like:', error);
      }
    });
  }

  toggleComments(postId: number): void {
    this.showComments[postId] = !this.showComments[postId];
    
    if (this.showComments[postId] && !this.comments[postId]) {
      this.loadComments(postId);
    }
  }

  loadComments(postId: number): void {
    this.loadingComments[postId] = true;

    this.commentService.getPostComments(postId).subscribe({
      next: (response) => {
        this.comments[postId] = response.comments || [];
        this.loadingComments[postId] = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commentaires:', error);
        this.loadingComments[postId] = false;
      }
    });
  }

  addComment(postId: number): void {
    const contenu = this.newComment[postId];
    if (!contenu || !contenu.trim()) {
      return;
    }

    const commentData: CreateCommentRequest = {
      contenu: contenu.trim(),
      post_id: postId
    };

    this.commentService.createComment(commentData).subscribe({
      next: (response) => {
        if (!this.comments[postId]) {
          this.comments[postId] = [];
        }
        this.comments[postId].push(response.comment);
        this.newComment[postId] = '';
        
        // Mettre à jour le nombre de commentaires du post
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.nombre_commentaires++;
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
      }
    });
  }

  toggleCommentLike(comment: Comment): void {
    this.likeService.toggleCommentLike(comment.id).subscribe({
      next: (response) => {
        comment.user_a_like = response.action === 'like';
        comment.nombre_likes = response.total_likes;
      },
      error: (error) => {
        console.error('Erreur lors du like du commentaire:', error);
      }
    });
  }

  canEditPost(post: Post): boolean {
    return this.currentUser?.id === post.user_id;
  }

  canEditComment(comment: Comment): boolean {
    return this.currentUser?.id === comment.user_id;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `Il y a ${diffInDays}j`;
      } else {
        return date.toLocaleDateString('fr-FR');
      }
    }
  }
}
