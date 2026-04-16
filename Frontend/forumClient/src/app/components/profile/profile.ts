import { Component, effect, inject, input, signal } from '@angular/core';
import { User } from '../../models/user.model';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../services/authentication-service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  user = input<User | null>(null);
  authService = inject(AuthenticationService);
  userService = inject(UserService);
  isFollowing = signal(false);

  constructor() {
    effect(() => {
      const profileUser = this.user();
      const currentUser = this.authService.user;
      if (!profileUser || !currentUser || profileUser.id === currentUser.id) {
        this.isFollowing.set(false);
        return;
      }
      this.userService.isFollowingUser(profileUser.id).subscribe({
        next: res => this.isFollowing.set(res.isFollowing),
        error: () => this.isFollowing.set(false)
      });
    });
  }

  toggleFollow(targetId: number) {
    if (!this.authService.user) return;
    const following = this.isFollowing();
    const request$ = following
      ? this.userService.unfollowUser(targetId)
      : this.userService.followUser(targetId);

    request$.subscribe({
      next: () => {
        this.isFollowing.set(!following);
        const profileUser = this.user();
        if (profileUser) {
          const delta = following ? -1 : 1;
          profileUser.followerCount = (profileUser.followerCount ?? 0) + delta;
        }
      },
      error: err => console.error('Follow toggle failed', err)
    });
  }

  isOwnProfile(): boolean {
    const currentUser = this.authService.user;
    const profileUser = this.user();
    return !!currentUser && !!profileUser && currentUser.id === profileUser.id;
  }
}
