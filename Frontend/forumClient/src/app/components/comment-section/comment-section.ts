import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentDTO } from '../../models/comment.model';
import { CommentService } from '../../services/comment-service';
import { Comment } from '../comment/comment';
import { AuthenticationService } from '../../services/authentication-service';

@Component({
  selector: 'app-comment-section',
  imports: [CommonModule, FormsModule, Comment],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.scss',
})
export class CommentSection implements OnInit {
  @Input() postId!: number;

  comments = signal<CommentDTO[]>([]);
  newCommentText = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string>('');
  private commentService = inject(CommentService);
  private auth = inject(AuthenticationService);

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.isLoading.set(true);
    this.error.set('');

    this.commentService.getComments(this.postId).subscribe({
      next: (data) => {
        this.comments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.error.set('Failed to load comments');
        this.isLoading.set(false);
      }
    });
  }

  addComment() {
    const text = this.newCommentText();
    if (!text.trim()) {
      this.error.set('Comment cannot be empty');
      return;
    }

    if (!this.auth.user) {
      this.error.set('You must be logged in to comment');
      return;
    }

    const userId = this.auth.user.id;
    this.isLoading.set(true);
    this.error.set('');

    this.commentService.addComment(this.postId, userId, text).subscribe({
      next: () => {
        this.newCommentText.set('');
        this.loadComments();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.error.set('Failed to add comment');
        this.isLoading.set(false);
      }
    });
  }
}
