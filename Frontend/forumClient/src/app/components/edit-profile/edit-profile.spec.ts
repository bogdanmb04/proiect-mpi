import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditProfile } from './edit-profile';
import { UserService } from '../../services/user-service';
import { AuthenticationService } from '../../services/authentication-service';
import { User } from '../../models/user.model';

describe('EditProfile', () => {
  let component: EditProfile;
  let fixture: ComponentFixture<EditProfile>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceStub: { user: User | null };

  const authUser: User = {
    id: 1,
    username: 'current-user',
    description: 'old desc',
    icon: 'old-icon',
    role: 'USER'
  };

  const loadedUser: User = {
    id: 1,
    username: 'alice',
    description: 'about me',
    icon: 'icon-base64',
    role: 'USER',
    followerCount: 10,
    followingCount: 3
  };

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'getUserById',
      'updateUserProfile'
    ]);
    userServiceSpy.getUserById.and.returnValue(of(loadedUser));
    userServiceSpy.updateUserProfile.and.returnValue(of(new HttpResponse<object>({ status: 200 })));

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    authServiceStub = { user: { ...authUser } };

    await TestBed.configureTestingModule({
      imports: [EditProfile],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthenticationService, useValue: authServiceStub },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        }
      ]
    })
      .overrideComponent(EditProfile, {
        set: {
          template: '<div></div>'
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init when editing own profile', () => {
    expect(component.userId()).toBe(1);
    expect(userServiceSpy.getUserById).toHaveBeenCalledWith(1);
    expect(component.username()).toBe('alice');
    expect(component.description()).toBe('about me');
    expect(component.currentIcon()).toBe('icon-base64');
  });

  it('should set error message when loading user data fails', () => {
    userServiceSpy.getUserById.and.returnValue(throwError(() => new Error('boom')));

    component.loadUserData(1);

    expect(component.errorMessage()).toBe('Failed to load profile data');
  });

  it('should validate username before save', () => {
    component.username.set('   ');

    component.saveProfile();

    expect(component.errorMessage()).toBe('Username is required');
    expect(userServiceSpy.updateUserProfile).not.toHaveBeenCalled();
  });

  it('should save profile and update auth user then navigate on success', () => {
    const localStorageSpy = spyOn(Storage.prototype, 'setItem');
    component.userId.set(1);
    component.username.set('new-name');
    component.description.set('new description');
    component.currentIcon.set('old-icon');
    component.newIconBase64.set('new-icon');

    component.saveProfile();

    expect(userServiceSpy.updateUserProfile).toHaveBeenCalledWith({
      id: 1,
      username: 'new-name',
      description: 'new description',
      icon: 'new-icon'
    });
    expect(authServiceStub.user?.username).toBe('new-name');
    expect(authServiceStub.user?.icon).toBe('new-icon');
    expect(localStorageSpy).toHaveBeenCalledWith('user', JSON.stringify(authServiceStub.user));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile', 1]);
  });

  it('should set error message and clear loading on save failure', () => {
    userServiceSpy.updateUserProfile.and.returnValue(
      throwError(() => ({ error: { message: 'Cannot update profile' } }))
    );
    component.userId.set(1);
    component.username.set('name');
    component.description.set('desc');

    component.saveProfile();

    expect(component.errorMessage()).toBe('Cannot update profile');
    expect(component.isLoading()).toBeFalse();
  });

  it('should use fallback error message on save failure without backend message', () => {
    userServiceSpy.updateUserProfile.and.returnValue(throwError(() => ({ error: {} })));
    component.userId.set(1);
    component.username.set('name');
    component.description.set('desc');

    component.saveProfile();

    expect(component.errorMessage()).toBe('Failed to update profile');
  });

  it('should return new icon when available, otherwise current icon', () => {
    component.currentIcon.set('current');
    component.newIconBase64.set('');
    expect(component.getDisplayIcon()).toBe('current');

    component.newIconBase64.set('new');
    expect(component.getDisplayIcon()).toBe('new');
  });

  it('should reject non-image file selection', () => {
    const textFile = new File(['txt'], 'note.txt', { type: 'text/plain' });
    const fakeInput = { files: [textFile] } as unknown as HTMLInputElement;

    component.onFileSelected({ target: fakeInput } as unknown as Event);

    expect(component.errorMessage()).toBe('Please select an image file');
  });

  it('should read selected image file as base64', () => {
    const readAsDataURL = jasmine.createSpy('readAsDataURL').and.callFake(function (this: FileReader) {
      Object.defineProperty(this, 'result', {
        configurable: true,
        get: () => 'data:image/png;base64,mocked-base64'
      });
      if (this.onload) {
        this.onload(new ProgressEvent('load') as ProgressEvent<FileReader>);
      }
    });

    class MockFileReader {
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      result: string | ArrayBuffer | null = null;
      readAsDataURL = readAsDataURL;
    }

    const originalFileReader = window.FileReader;
    (window as unknown as { FileReader: typeof FileReader }).FileReader = MockFileReader as unknown as typeof FileReader;

    const imageFile = new File(['img'], 'avatar.png', { type: 'image/png' });
    const fakeInput = { files: [imageFile] } as unknown as HTMLInputElement;

    component.onFileSelected({ target: fakeInput } as unknown as Event);

    expect(readAsDataURL).toHaveBeenCalledTimes(1);
    expect(component.newIconBase64()).toBe('mocked-base64');

    (window as unknown as { FileReader: typeof FileReader }).FileReader = originalFileReader;
  });

  it('should navigate back to profile on cancel', () => {
    component.userId.set(1);

    component.cancel();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile', 1]);
  });
});
