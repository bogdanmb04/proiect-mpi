import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PostPreview } from './post-preview';
import { PostsService } from '../../services/posts-service';
import { AuthenticationService } from '../../services/authentication-service';

describe('PostPreview', () => {
  let component: PostPreview;
  let fixture: ComponentFixture<PostPreview>;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;
  let authServiceStub: { user: { id: number; role: string } | null };
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    postsServiceSpy = jasmine.createSpyObj<PostsService>('PostsService', [
      'isPostLiked',
      'likePost',
      'unlikePost'
    ]);
    postsServiceSpy.isPostLiked.and.returnValue(of({ isLiked: true }));
    postsServiceSpy.likePost.and.returnValue(of({ liked: true, likeCount: 11 }));
    postsServiceSpy.unlikePost.and.returnValue(of({ liked: false, likeCount: 9 }));

    authServiceStub = { user: { id: 1, role: 'USER' } };
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PostPreview],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PostsService, useValue: postsServiceSpy },
        { provide: AuthenticationService, useValue: authServiceStub },
        { provide: Router, useValue: routerSpy }
      ]
    })
      .overrideComponent(PostPreview, {
        set: {
          imports: [],
          template: '<div></div>'
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PostPreview);
    component = fixture.componentInstance;
  });

  function setRequiredInputs(): void {
    fixture.componentRef.setInput('userId', 1);
    fixture.componentRef.setInput('postId', 7);
    fixture.componentRef.setInput('likeNo', 10);
    fixture.componentRef.setInput('date', '2026-04-16');
    fixture.componentRef.setInput('images', []);
  }

  it('should create', () => {
    setRequiredInputs();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set likeCount from likeNo input using effect', () => {
    setRequiredInputs();
    fixture.detectChanges();
    expect(component.likeCount()).toBe(10);

    fixture.componentRef.setInput('likeNo', 25);
    fixture.detectChanges();
    expect(component.likeCount()).toBe(25);
  });

  it('should load isLiked when postId and user are present', () => {
    setRequiredInputs();
    fixture.detectChanges();

    expect(postsServiceSpy.isPostLiked).toHaveBeenCalledWith(7);
    expect(component.isLiked()).toBeTrue();
  });

  it('should set isLiked false when there is no user or no post id', () => {
    authServiceStub.user = null;
    fixture.componentRef.setInput('postId', 7);
    fixture.detectChanges();
    expect(component.isLiked()).toBeFalse();

    authServiceStub.user = { id: 1, role: 'USER' };
    fixture.componentRef.setInput('postId', undefined);
    fixture.detectChanges();
    expect(component.isLiked()).toBeFalse();
  });

  it('should set isLiked false when isPostLiked request fails', () => {
    postsServiceSpy.isPostLiked.and.returnValue(throwError(() => new Error('boom')));
    setRequiredInputs();

    fixture.detectChanges();

    expect(component.isLiked()).toBeFalse();
  });

  it('should like post when currently unliked', () => {
    setRequiredInputs();
    fixture.detectChanges();
    component.isLiked.set(false);

    component.toggleLike();

    expect(postsServiceSpy.likePost).toHaveBeenCalledWith(7);
    expect(component.isLiked()).toBeTrue();
    expect(component.likeCount()).toBe(11);
  });

  it('should unlike post when currently liked', () => {
    setRequiredInputs();
    fixture.detectChanges();
    component.isLiked.set(true);

    component.toggleLike();

    expect(postsServiceSpy.unlikePost).toHaveBeenCalledWith(7);
    expect(component.isLiked()).toBeFalse();
    expect(component.likeCount()).toBe(9);
  });

  it('should ignore toggleLike when user or postId is missing', () => {
    setRequiredInputs();
    fixture.detectChanges();

    authServiceStub.user = null;
    component.toggleLike();

    authServiceStub.user = { id: 1, role: 'USER' };
    fixture.componentRef.setInput('postId', undefined);
    fixture.detectChanges();
    component.toggleLike();

    expect(postsServiceSpy.likePost).not.toHaveBeenCalled();
    expect(postsServiceSpy.unlikePost).not.toHaveBeenCalled();
  });

  it('should navigate to post details when goToPost has post id', () => {
    fixture.componentRef.setInput('postId', 42);
    fixture.detectChanges();

    component.goToPost();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/post', 42]);
  });

  it('should toggle menu state', () => {
    setRequiredInputs();
    fixture.detectChanges();

    expect(component.menuOpen()).toBeFalse();
    component.toggleMenu();
    expect(component.menuOpen()).toBeTrue();
    component.toggleMenu();
    expect(component.menuOpen()).toBeFalse();
  });

  it('should evaluate canEdit for owner/admin/other', () => {
    fixture.componentRef.setInput('userId', 1);
    fixture.detectChanges();

    authServiceStub.user = { id: 1, role: 'USER' };
    expect(component.canEdit()).toBeTrue();

    authServiceStub.user = { id: 2, role: 'ADMIN' };
    expect(component.canEdit()).toBeTrue();

    authServiceStub.user = { id: 2, role: 'USER' };
    expect(component.canEdit()).toBeFalse();
  });

  it('should navigate to edit page only when canEdit is true', () => {
    fixture.componentRef.setInput('postId', 7);
    fixture.componentRef.setInput('userId', 1);
    fixture.detectChanges();

    authServiceStub.user = { id: 1, role: 'USER' };
    component.editPost();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/post', 7, 'edit']);

    routerSpy.navigate.calls.reset();
    authServiceStub.user = { id: 2, role: 'USER' };
    component.editPost();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should format date and image helpers', () => {
    expect(component.formatDate(undefined)).toBe('');
    expect(component.formatDate('2026-04-16')).toContain('2026');
    expect(component.getImageDataUrl('abc')).toBe('data:image/png;base64,abc');
  });
});
