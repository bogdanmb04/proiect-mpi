import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Register } from './register';
import { AuthenticationService } from '../../services/authentication-service';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthenticationService>('AuthenticationService', ['register']);
    authServiceSpy.register.and.returnValue(of(new HttpResponse<string>({ status: 200, body: 'ok' })));

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
      .overrideComponent(Register, {
        set: {
          template: '<form [formGroup]="registerForm"></form>'
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls with empty values', () => {
    expect(component.registerForm.value.username).toBe('');
    expect(component.registerForm.value.email).toBe('');
    expect(component.registerForm.value.password).toBe('');
    expect(component.registerForm.value.confirmPassword).toBe('');
    expect(component.registerForm.invalid).toBeTrue();
  });

  it('should call register with mapped form data', () => {
    component.registerForm.setValue({
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret1',
      confirmPassword: 'secret1'
    });

    component.registerUser();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret1'
    });
  });

  it('should navigate to login on successful registration', () => {
    component.registerForm.setValue({
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret1',
      confirmPassword: 'secret1'
    });

    component.registerUser();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.errorMessage).toBe('');
  });

  it('should set errorMessage when response status is not 200', () => {
    authServiceSpy.register.and.returnValue(
      of(new HttpResponse<string>({ status: 201, body: 'Already exists' }))
    );
    component.registerForm.setValue({
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret1',
      confirmPassword: 'secret1'
    });

    component.registerUser();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Already exists');
  });

  it('should set default non-200 error message when response body missing', () => {
    authServiceSpy.register.and.returnValue(of(new HttpResponse<string>({ status: 201 })));
    component.registerForm.setValue({
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret1',
      confirmPassword: 'secret1'
    });

    component.registerUser();

    expect(component.errorMessage).toBe('Registration failed. Please try again.');
  });

  it('should set backend error message on request failure', () => {
    authServiceSpy.register.and.returnValue(throwError(() => ({ error: 'Email already used' })));

    component.registerUser();

    expect(component.errorMessage).toBe('Email already used');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should set fallback error message when error body is missing', () => {
    authServiceSpy.register.and.returnValue(throwError(() => ({ error: null })));

    component.registerUser();

    expect(component.errorMessage).toBe('An error occurred during registration. Please try again.');
  });

  it('should map null form values to empty strings in payload', () => {
    component.registerForm.setValue({
      username: null,
      email: null,
      password: null,
      confirmPassword: null
    });

    component.registerUser();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      username: '',
      email: '',
      password: ''
    });
  });
});
