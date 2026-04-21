import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Home } from './home';
import { PostsService } from '../../services/posts-service';
import { PostDTO } from '../../models/post.model';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;

  const mockPosts: PostDTO[] = [
    {
      userId: 1,
      userIcon: 'icon',
      username: 'alice',
      postId: 11,
      title: 'First',
      date: '2026-04-16',
      body: 'Body',
      categoryId: 2,
      category: 'General',
      images: [],
      likeNo: 1,
      commentNo: 2
    }
  ];

  beforeEach(async () => {
    postsServiceSpy = jasmine.createSpyObj<PostsService>('PostsService', ['getPosts', 'getCategories']);
    postsServiceSpy.getPosts.and.returnValue(of(mockPosts));
    postsServiceSpy.getCategories.and.returnValue(of(['General', 'Tech']));

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PostsService, useValue: postsServiceSpy }
      ]
    })
      .overrideComponent(Home, {
        set: {
          imports: [],
          template: '<div></div>'
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load posts and categories on init', () => {
    expect(postsServiceSpy.getPosts).toHaveBeenCalled();
    expect(postsServiceSpy.getCategories).toHaveBeenCalled();
    expect(component.posts()).toEqual(mockPosts);
    expect(component.categories()).toEqual(['General', 'Tech']);
  });

  it('should set posts to empty array when loading posts fails', () => {
    postsServiceSpy.getPosts.and.returnValue(throwError(() => new Error('boom')));

    component.loadPosts();

    expect(component.posts()).toEqual([]);
  });

  it('should keep categories unchanged when loading categories fails', () => {
    component.categories.set(['Existing']);
    postsServiceSpy.getCategories.and.returnValue(throwError(() => new Error('boom')));

    component.loadCategories();

    expect(component.categories()).toEqual(['Existing']);
  });

  it('should set categories when loadCategories succeeds', () => {
    postsServiceSpy.getCategories.and.returnValue(of(['Art', 'Science']));

    component.loadCategories();

    expect(component.categories()).toEqual(['Art', 'Science']);
  });
});
