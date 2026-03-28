import { Component, inject, input, effect, signal } from '@angular/core';
import { PostsService } from '../../services/posts-service';
import { PostDTO } from '../../models/post.model';
//import { PostPreview } from '../post-preview/post-preview';

@Component({
  selector: 'app-post-stream',
  //imports: [PostPreview],
  templateUrl: './post-stream.html',
  styleUrl: './post-stream.scss',
})
export class PostStream {
  private postsService = inject(PostsService);

  posts = input<PostDTO[] | null>(null);
  filter = input<string | number | null>(null);
  isLoading = signal(false);
  displayPosts = signal<PostDTO[] | null>(null);

  constructor() {
    effect(() => {
      const inputPosts = this.posts();
      const filterValue = this.filter();

      if (inputPosts !== null && inputPosts !== undefined) {
        this.displayPosts.set(inputPosts);
        this.isLoading.set(false);
        return;
      }
      const postsInputBound = this.posts !== undefined;
      if (postsInputBound) {
        this.displayPosts.set(null);
        this.isLoading.set(true);
        return;
      }

      if (filterValue === null) {
        this.isLoading.set(true);
        this.postsService.getPosts().subscribe({
          next: (data) => {
            this.displayPosts.set(data);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to fetch posts:', err);
            this.displayPosts.set([]);
            this.isLoading.set(false);
          }
        });
      } else if (typeof filterValue === 'number') {
        this.isLoading.set(true);
        this.postsService.getPostsFromUser(filterValue).subscribe({
          next: (data) => {
            this.displayPosts.set(data);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to fetch user posts:', err);
            this.displayPosts.set([]);
            this.isLoading.set(false);
          }
        });
      } else if (typeof filterValue === 'string') {
        this.isLoading.set(true);
        this.postsService.getPostsInCategory(filterValue).subscribe({
          next: (data) => {
            this.displayPosts.set(data);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to fetch category posts:', err);
            this.displayPosts.set([]);
            this.isLoading.set(false);
          }
        });
      }
    });
  }
}
