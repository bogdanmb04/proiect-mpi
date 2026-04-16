import { Component, input, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageCarousel } from '../image-carousel/image-carousel';
import { PostsService } from '../../services/posts-service';
import { AuthenticationService } from '../../services/authentication-service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-post-preview',
  imports: [CommonModule, RouterLink, ImageCarousel],
  templateUrl: './post-preview.html',
  styleUrl: './post-preview.scss',
})
export class PostPreview {
  userId = input<number>();
  userIcon = input<string>();
  username = input<string>();
  postId = input<number>();
  title = input<string>();
  date = input<Date | string>();
  body = input<string>();
  category = input<string>();
  images = input<string[]>();
  likeNo = input<number>();
  commentNo = input<number>();
  isLiked = signal(false);
  likeCount = signal(0);
  menuOpen = signal(false);
  private postsService = inject(PostsService);
  auth = inject(AuthenticationService);
  private router = inject(Router);

  constructor() {
    effect(() => this.likeCount.set(this.likeNo() ?? 0));
    effect(() => {
      const postId = this.postId();
      if (!postId || !this.auth.user) {
        this.isLiked.set(false);
        return;
      }
      this.postsService.isPostLiked(postId).subscribe({
        next: res => this.isLiked.set(res.isLiked),
        error: () => this.isLiked.set(false)
      });
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
    const postId = this.postId();
    if (!postId) return;

    const liked = this.isLiked();
    const req$ = liked
      ? this.postsService.unlikePost(postId)
      : this.postsService.likePost(postId);

    req$.subscribe({
      next: res => {
        this.isLiked.set(!liked);
        this.likeCount.set(res.likeCount);
      },
      error: err => console.error('Like toggle failed', err)
    });
  }

  goToPost() {
    const postId = this.postId();
    if (postId) {
      this.router.navigate(['/post', postId]);
    }
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  canEdit(): boolean {
    const user = this.auth.user;
    const ownerId = this.userId();
    if (!user || ownerId === undefined) return false;
    return user.id === ownerId || user.role === 'ADMIN';
  }

  editPost() {
    const postId = this.postId();
    if (!postId) return;
    if (!this.canEdit()) return;

    // Navigate to edit page
    this.router.navigate(['/post', postId, 'edit']);
  }
}
