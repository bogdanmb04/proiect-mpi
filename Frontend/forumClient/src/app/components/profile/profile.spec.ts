import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Profile } from './profile';
import { AuthenticationService } from '../../services/authentication-service';
import { UserService } from '../../services/user-service';
import { User } from '../../models/user.model';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let authServiceStub: { user: { id: number; role: string } | null };
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const profileUser: User = {
    id: 2,
    username: 'alice',
    description: 'desc',
    icon: 'icon',
    role: 'USER',
    followerCount: 5,
    followingCount: 3
  };

  beforeEach(async () => {
    authServiceStub = {
      user: { id: 1, role: 'USER' }
    };

    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'isFollowingUser',
      'followUser',
      'unfollowUser'
    ]);
    userServiceSpy.isFollowingUser.and.returnValue(of({ isFollowing: true }));
    userServiceSpy.followUser.and.returnValue(of(new HttpResponse<object>({ status: 200 })));
    userServiceSpy.unfollowUser.and.returnValue(of(new HttpResponse<object>({ status: 200 })));

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthenticationService, useValue: authServiceStub },
        { provide: UserService, useValue: userServiceSpy }
      ]
    })
      .overrideComponent(Profile, {
        set: {
          imports: [],
          template: '<div></div>'
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('user', profileUser);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should check follow state when viewing another user while logged in', () => {
    fixture.componentRef.setInput('user', profileUser);
    fixture.detectChanges();

    expect(userServiceSpy.isFollowingUser).toHaveBeenCalledWith(2);
    expect(component.isFollowing()).toBeTrue();
  });

  it('should set isFollowing false when viewing own profile or without auth', () => {
    fixture.componentRef.setInput('user', { ...profileUser, id: 1 });
    fixture.detectChanges();
    expect(component.isFollowing()).toBeFalse();

    authServiceStub.user = null;
    fixture.componentRef.setInput('user', { ...profileUser, id: 2 });
    fixture.detectChanges();
    expect(component.isFollowing()).toBeFalse();
  });

  it('should set isFollowing false when follow-state request fails', () => {
    userServiceSpy.isFollowingUser.and.returnValue(throwError(() => new Error('boom')));
    fixture.componentRef.setInput('user', profileUser);

    fixture.detectChanges();

    expect(component.isFollowing()).toBeFalse();
  });

  it('should follow user and increase follower count', () => {
    fixture.componentRef.setInput('user', { ...profileUser, followerCount: 5 });
    fixture.detectChanges();
    component.isFollowing.set(false);

    component.toggleFollow(2);

    expect(userServiceSpy.followUser).toHaveBeenCalledWith(2);
    expect(component.isFollowing()).toBeTrue();
    expect(component.user()?.followerCount).toBe(6);
  });

  it('should unfollow user and decrease follower count', () => {
    fixture.componentRef.setInput('user', { ...profileUser, followerCount: 5 });
    fixture.detectChanges();
    component.isFollowing.set(true);

    component.toggleFollow(2);

    expect(userServiceSpy.unfollowUser).toHaveBeenCalledWith(2);
    expect(component.isFollowing()).toBeFalse();
    expect(component.user()?.followerCount).toBe(4);
  });

  it('should not toggle follow when user is not authenticated', () => {
    fixture.componentRef.setInput('user', profileUser);
    fixture.detectChanges();
    authServiceStub.user = null;

    component.toggleFollow(2);

    expect(userServiceSpy.followUser).not.toHaveBeenCalled();
    expect(userServiceSpy.unfollowUser).not.toHaveBeenCalled();
  });

  it('should keep follow state unchanged if follow request fails', () => {
    userServiceSpy.followUser.and.returnValue(throwError(() => new Error('boom')));
    fixture.componentRef.setInput('user', { ...profileUser, followerCount: 5 });
    fixture.detectChanges();
    component.isFollowing.set(false);

    component.toggleFollow(2);

    expect(component.isFollowing()).toBeFalse();
    expect(component.user()?.followerCount).toBe(5);
  });

  it('should detect own profile correctly', () => {
    authServiceStub.user = { id: 10, role: 'USER' };
    fixture.componentRef.setInput('user', { ...profileUser, id: 10 });
    fixture.detectChanges();
    expect(component.isOwnProfile()).toBeTrue();

    fixture.componentRef.setInput('user', { ...profileUser, id: 20 });
    fixture.detectChanges();
    expect(component.isOwnProfile()).toBeFalse();
  });
});
