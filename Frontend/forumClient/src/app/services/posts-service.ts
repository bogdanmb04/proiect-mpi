import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { map } from 'rxjs/operators';
import { PostDTO } from '../models/post.model';
import { MakePostDTO } from '../models/make-post.model';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private api = environment.postsApi;
  private http = inject(HttpClient);

  getPosts() {
    return this.http.get<{ posts: PostDTO[] }>(`${this.api}`).pipe(
      map(response => response.posts)
    );
  }

  getPost(postId: number) {
    return this.http.get<PostDTO>(`${this.api}/post/${postId}`);
  }

  getPostsInCategory(category: string) {
    return this.http.get<{ posts: PostDTO[] }>(`${this.api}/${category}`).pipe(
      map(response => response.posts)
    );
  }

  getPostsFromUser(id: number) {
    return this.http.get<{ posts: PostDTO[] }>(`${this.api}/${id}`).pipe(
      map(response => response.posts)
    );
  }

  getCategories() {
    console.log('Fetching categories from API');
    return this.http.get<string[]>(`${this.api}/categories`);
  }

  getCategoriesFull() {
    return this.http.get<{ categoryId: number; name: string }[]>(`${this.api}/categories/full`);
  }

  createPost(dto: MakePostDTO) {
    return this.http.post(
      `${this.api}`,
      dto,
      {
        responseType: 'text' as const,
        observe: 'response' as const,
        withCredentials: true
      }
    );
  }

  likePost(postId: number) {
    return this.http.post<{ liked: boolean; likeCount: number }>(
      `${this.api}/${postId}/like`,
      {},
      { withCredentials: true }
    );
  }

  unlikePost(postId: number) {
    return this.http.post<{ liked: boolean; likeCount: number }>(
      `${this.api}/${postId}/unlike`,
      {},
      { withCredentials: true }
    );
  }

  isPostLiked(postId: number) {
    return this.http.get<{ isLiked: boolean }>(
      `${this.api}/${postId}/like/state`,
      { withCredentials: true }
    );
  }

  updatePost(id: number, dto: MakePostDTO) {
    return this.http.put(
      `${this.api}/${id}`,
      dto,
      {
        responseType: 'json' as const,
        observe: 'response' as const,
        withCredentials: true
      }
    );
  }
}
