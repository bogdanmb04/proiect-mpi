import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Comment } from './comment';
import { CommentDTO } from '../../models/comment.model';

describe('Comment', () => {
  let component: Comment;
  let fixture: ComponentFixture<Comment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Comment],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(Comment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display comment', () => {
    const mockComment: CommentDTO = {
      userId: 1,
      username: 'user',
      userIcon: '...',
      commentText: 'Test comment'
    };

    fixture.componentRef.setInput('comment', mockComment);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test comment');
  });
});