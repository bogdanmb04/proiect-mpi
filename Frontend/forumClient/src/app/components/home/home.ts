import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostStream } from '../post-stream/post-stream';
import { PostsService } from '../../services/posts-service';
import { PostDTO } from '../../models/post.model';
import { PostComposer } from '../post-composer/post-composer';

@Component({
  selector: 'app-home',
  imports: [PostStream, PostComposer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private postsService = inject(PostsService);

  posts = signal<PostDTO[] | null>(null);
  categories = signal<string[]>([]);

  ngOnInit() {
    this.loadPosts();
    this.loadCategories();
  }

  loadPosts() {
    this.postsService.getPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
      },
      error: (err) => {
        console.error('Failed to load posts:', err);
        this.posts.set([]);
      }
    });
  }

  loadCategories() {
    this.postsService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }
}
