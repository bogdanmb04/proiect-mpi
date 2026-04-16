import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { CommentDTO } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private api = environment.postsApi;

  constructor(private http: HttpClient) { }

  getComments(postId: number) {
    return this.http.get<CommentDTO[]>(`${this.api}/comments/${postId}`, {
      withCredentials: true
    });
  }

  addComment(postId: number, userId: number, text: string) {
    return this.http.post(
      `${this.api}/comment`,
      {
        postId: postId,
        userId: userId,
        text: text
      },
      {
        responseType: 'text' as const,
        observe: 'response' as const,
        withCredentials: true
      }
    );
  }
}
