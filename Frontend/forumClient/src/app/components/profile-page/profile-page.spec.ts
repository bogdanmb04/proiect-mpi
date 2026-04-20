import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfilePage } from './profile-page';
import { UserService } from '../../services/user-service';
import { PostsService } from '../../services/posts-service';
import { User } from '../../models/user.model';
import { PostDTO } from '../../models/post.model';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;

  const mockUser: User = {
    id: 2,
    username: 'alice',
    description: 'desc',
    icon: 'icon',
    role: 'USER',
    followerCount: 10,
    followingCount: 5
  };

  const mockPosts: PostDTO[] = [
    {
      userId: 2,
      userIcon: 'icon',
      username: 'alice',
      postId: 20,
      title: 'Hello',
      date: '2026-04-16',
      body: 'Body',
      categoryId: 1,
      category: 'General',
      images: [],
      likeNo: 1,
      commentNo: 0
    }
  ];

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['getUserById']);
    postsServiceSpy = jasmine.createSpyObj<PostsService>('PostsService', ['getPostsFromUser']);

    userServiceSpy.getUserById.and.returnValue(of(mockUser));
    postsServiceSpy.getPostsFromUser.and.returnValue(of(mockPosts));

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: PostsService, useValue: postsServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '2' })
          }
        }
      ]
    })
      .overrideComponent(ProfilePage, {
        set: {
          imports: [],
          template: '<div></div>'
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user and user posts from route id', () => {
    expect(userServiceSpy.getUserById).toHaveBeenCalledWith(2);
    expect(postsServiceSpy.getPostsFromUser).toHaveBeenCalledWith(2);
    expect(component.user()).toEqual(mockUser);
    expect(component.userPosts()).toEqual(mockPosts);
  });

  it('should set user to null when loading user fails', () => {
    userServiceSpy.getUserById.and.returnValue(throwError(() => new Error('boom')));

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.user()).toBeNull();
  });

  it('should set userPosts to empty array when loading posts fails', () => {
    postsServiceSpy.getPostsFromUser.and.returnValue(throwError(() => new Error('boom')));

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.userPosts()).toEqual([]);
  });

  it('should handle both user and posts failure independently', () => {
    userServiceSpy.getUserById.and.returnValue(throwError(() => new Error('user error')));
    postsServiceSpy.getPostsFromUser.and.returnValue(throwError(() => new Error('posts error')));

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.user()).toBeNull();
    expect(component.userPosts()).toEqual([]);
  });
});
