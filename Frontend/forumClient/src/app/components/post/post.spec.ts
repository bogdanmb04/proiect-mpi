import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Post } from './post';
import { PostsService } from '../../services/posts-service';
import { AuthenticationService } from '../../services/authentication-service';
import { PostDTO } from '../../models/post.model';

describe('Post', () => {
  let component: Post;
  let fixture: ComponentFixture<Post>;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;
  let authServiceStub: { user: { id: number; role: string } | null };
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPost: PostDTO = {
    userId: 1,
    userIcon: 'icon',
    username: 'alice',
    postId: 7,
    title: 'Post title',
    date: '2026-04-16',
    body: 'Post body',
    categoryId: 2,
    category: 'General',
    images: ['img1'],
    likeNo: 3,
    commentNo: 5
  };

  beforeEach(async () => {
    postsServiceSpy = jasmine.createSpyObj<PostsService>('PostsService', [
      'getPost',
      'isPostLiked',
      'likePost',
      'unlikePost'
    ]);
    postsServiceSpy.getPost.and.returnValue(of(mockPost));
    postsServiceSpy.isPostLiked.and.returnValue(of({ isLiked: true }));
    postsServiceSpy.likePost.and.returnValue(of({ liked: true, likeCount: 4 }));
    postsServiceSpy.unlikePost.and.returnValue(of({ liked: false, likeCount: 2 }));

    authServiceStub = { user: { id: 1, role: 'USER' } };
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Post],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PostsService, useValue: postsServiceSpy },
        { provide: AuthenticationService, useValue: authServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '7' }))
          }
        },
        { provide: Router, useValue: routerSpy }
      ]
    })
      .overrideComponent(Post, {
        set: {
          imports: [],
          template: '<div></div>'
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(Post);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load post on init and set like state/count', () => {
    expect(postsServiceSpy.getPost).toHaveBeenCalledWith(7);
    expect(postsServiceSpy.isPostLiked).toHaveBeenCalledWith(7);
    expect(component.post()).toEqual(mockPost);
    expect(component.likeCount()).toBe(3);
    expect(component.isLiked()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
    expect(component.error()).toBe('');
  });

  it('should set isLiked false when like-state request fails', () => {
    postsServiceSpy.isPostLiked.and.returnValue(throwError(() => new Error('boom')));

    component.loadPost(7);

    expect(component.isLiked()).toBeFalse();
  });

  it('should set error when post loading fails', () => {
    postsServiceSpy.getPost.and.returnValue(throwError(() => new Error('boom')));

    component.loadPost(7);

    expect(component.error()).toBe('Failed to load post');
    expect(component.isLoading()).toBeFalse();
  });

  it('should like post when currently unliked', () => {
    component.post.set(mockPost);
    component.isLiked.set(false);

    component.toggleLike();

    expect(postsServiceSpy.likePost).toHaveBeenCalledWith(7);
    expect(component.isLiked()).toBeTrue();
    expect(component.likeCount()).toBe(4);
  });

  it('should unlike post when currently liked', () => {
    component.post.set(mockPost);
    component.isLiked.set(true);

    component.toggleLike();

    expect(postsServiceSpy.unlikePost).toHaveBeenCalledWith(7);
    expect(component.isLiked()).toBeFalse();
    expect(component.likeCount()).toBe(2);
  });

  it('should ignore like toggle when user is not logged in or post is missing', () => {
    authServiceStub.user = null;
    component.post.set(mockPost);
    component.toggleLike();

    authServiceStub.user = { id: 1, role: 'USER' };
    component.post.set(undefined);
    component.toggleLike();

    expect(postsServiceSpy.likePost).not.toHaveBeenCalled();
    expect(postsServiceSpy.unlikePost).not.toHaveBeenCalled();
  });

  it('should toggle menu state', () => {
    expect(component.menuOpen()).toBeFalse();
    component.toggleMenu();
    expect(component.menuOpen()).toBeTrue();
    component.toggleMenu();
    expect(component.menuOpen()).toBeFalse();
  });

  it('should evaluate canEdit correctly for owner/admin/other', () => {
    component.post.set(mockPost);

    authServiceStub.user = { id: 1, role: 'USER' };
    expect(component.canEdit()).toBeTrue();

    authServiceStub.user = { id: 2, role: 'ADMIN' };
    expect(component.canEdit()).toBeTrue();

    authServiceStub.user = { id: 2, role: 'USER' };
    expect(component.canEdit()).toBeFalse();

    authServiceStub.user = null;
    expect(component.canEdit()).toBeFalse();
  });

  it('should navigate to edit page only when editable', () => {
    component.post.set(mockPost);
    authServiceStub.user = { id: 1, role: 'USER' };

    component.editPost();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/post', 7, 'edit']);

    routerSpy.navigate.calls.reset();
    authServiceStub.user = { id: 2, role: 'USER' };
    component.editPost();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should format date and image url helpers', () => {
    expect(component.formatDate(undefined)).toBe('');
    expect(component.formatDate('2026-04-16')).toContain('2026');
    expect(component.getImageDataUrl('abc')).toBe('data:image/png;base64,abc');
  });

  it('should scroll to comments section when present', () => {
    const scrollIntoView = jasmine.createSpy('scrollIntoView');
    spyOn(document, 'getElementById').and.returnValue({
      scrollIntoView
    } as unknown as HTMLElement);

    component.scrollToComments();

    expect(document.getElementById).toHaveBeenCalledWith('comments-section');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});
