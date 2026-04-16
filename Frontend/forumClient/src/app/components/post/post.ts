import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommentSection } from '../comment-section/comment-section';
import { PostDTO } from '../../models/post.model';
import { PostsService } from '../../services/posts-service';
import { AuthenticationService } from '../../services/authentication-service';
import { ImageCarousel } from '../image-carousel/image-carousel';

@Component({
  selector: 'app-post',
  imports: [CommonModule, RouterLink, CommentSection, ImageCarousel],
  templateUrl: './post.html',
  styleUrl: './post.scss',
})
export class Post implements OnInit {
  post = signal<PostDTO | undefined>(undefined);
  isLiked = signal(false);
  likeCount = signal(0);
  isLoading = signal(false);
  error = signal('');
  menuOpen = signal(false);
  private postsService = inject(PostsService);
  auth = inject(AuthenticationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const postId = params.get('id');
      if (postId) {
        this.loadPost(Number(postId));
      }
    });
  }

  loadPost(postId: number) {
    this.isLoading.set(true);
    this.error.set('');

    this.postsService.getPost(postId).subscribe({
      next: (postData) => {
        this.post.set(postData);
        this.likeCount.set(postData.likeNo ?? 0);
        this.isLoading.set(false);

        // Check if liked after post is loaded
        if (this.auth.user) {
          this.postsService.isPostLiked(postId).subscribe({
            next: res => this.isLiked.set(res.isLiked),
            error: () => this.isLiked.set(false)
          });
        }
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.error.set('Failed to load post');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getImageDataUrl(base64: string): string {
    return `data:image/png;base64,${base64}`;
  }

  toggleLike() {
    if (!this.auth.user) return;
    const post = this.post();
    if (!post) return;

    const liked = this.isLiked();
    const req$ = liked
      ? this.postsService.unlikePost(post.postId)
      : this.postsService.likePost(post.postId);

    req$.subscribe({
      next: res => {
        this.isLiked.set(!liked);
        this.likeCount.set(res.likeCount);
      },
      error: err => console.error('Like toggle failed', err)
    });
  }

  scrollToComments() {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  canEdit(): boolean {
    const p = this.post();
    const user = this.auth.user;
    if (!p || !user) return false;
    return p.userId === user.id || user.role === 'ADMIN';
  }

  editPost() {
    const p = this.post();
    if (!p) return;
    if (!this.canEdit()) return;

    // Navigate to edit page or open edit modal
    this.router.navigate(['/post', p.postId, 'edit']);
  }
}

