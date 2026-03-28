import { Component, inject, signal, effect } from '@angular/core';
import { UserService } from '../../services/user-service';
import { PostsService } from '../../services/posts-service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.model';
import { PostDTO } from '../../models/post.model';
import { PostStream } from '../post-stream/post-stream';
import { Profile } from '../profile/profile';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  imports: [PostStream, Profile, CommonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {
  user = signal<User | null>(null);
  userPosts = signal<PostDTO[] | null>(null);

  private userService = inject(UserService);
  private postsService = inject(PostsService);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    effect(() => {
      this.activatedRoute.params.subscribe(params => {
        const id = Number(params['id']);

        this.userService.getUserById(id).subscribe({
          next: (user) => {
            this.user.set(user);
          },
          error: (err) => {
            console.error('Failed to load user:', err);
            this.user.set(null);
          }
        });

        this.postsService.getPostsFromUser(id).subscribe({
          next: (posts) => {
            this.userPosts.set(posts);
          },
          error: (err) => {
            console.error('Failed to load user posts:', err);
            this.userPosts.set([]);
          }
        });
      });
    });
  }
}
