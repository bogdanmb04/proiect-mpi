import { Component, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentDTO } from '../../models/comment.model';

@Component({
  selector: 'app-comment',
  imports: [CommonModule],
  templateUrl: './comment.html',
  styleUrl: './comment.scss',
})
export class Comment {
  comment = input<CommentDTO>();
}
