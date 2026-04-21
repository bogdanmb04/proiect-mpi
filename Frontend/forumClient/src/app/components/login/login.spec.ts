import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthenticationService } from '../../services/authentication-service';
import { LoginResponseDTO } from '../../models/login-response.model';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockResponseBody: LoginResponseDTO = {
    username: 'alice',
    userId: 1,
    icon: 'avatar',
    role: 'USER',
    accessToken: 'access',
    refreshToken: 'refresh'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthenticationService>('AuthenticationService', ['login', 'setUser']);
    authServiceSpy.login.and.returnValue(of(new HttpResponse<LoginResponseDTO>({
      status: 200,
      body: mockResponseBody
    })));

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
      .overrideComponent(Login, {
        set: {
          template: '<form [formGroup]="loginForm"></form>'
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty username and password', () => {
    expect(component.loginForm.value.username).toBe('');
    expect(component.loginForm.value.password).toBe('');
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('should call login with form values', () => {
    component.loginForm.setValue({ username: 'alice', password: 'secret' });

    component.loginUser();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'alice',
      password: 'secret'
    });
  });

  it('should set user and navigate to home on successful login', () => {
    component.loginForm.setValue({ username: 'alice', password: 'secret' });

    component.loginUser();

    expect(authServiceSpy.setUser).toHaveBeenCalledWith(mockResponseBody);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    expect(component.errorMessage()).toBe('');
  });

  it('should not set user or navigate when response is not successful', () => {
    authServiceSpy.login.and.returnValue(of(new HttpResponse<LoginResponseDTO>({ status: 204 })));
    component.loginForm.setValue({ username: 'alice', password: 'secret' });

    component.loginUser();

    expect(authServiceSpy.setUser).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should set server error message on login failure', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({
      error: { message: 'Invalid credentials' }
    })));

    component.loginUser();

    expect(component.errorMessage()).toBe('Invalid credentials');
    expect(authServiceSpy.setUser).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should set fallback error message when backend message is missing', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: {} })));

    component.loginUser();

    expect(component.errorMessage()).toBe('An error occurred during login.');
  });

  it('should map null form values to empty strings in payload', () => {
    component.loginForm.setValue({
      username: null,
      password: null
    });

    component.loginUser();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: '',
      password: ''
    });
  });
});
