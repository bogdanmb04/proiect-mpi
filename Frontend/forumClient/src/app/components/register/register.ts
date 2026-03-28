import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { passwordMatchValidator } from '../../validators/password-confirm';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';
import { RegisterDTO } from '../../models/register.model';
import { HttpResponse } from '@angular/common/http';
import { AuthenticationService } from '../../services/authentication-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  authService = inject(AuthenticationService);
  router = inject(Router);
  errorMessage: string = '';

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator() });

  registerUser() {
    const data: RegisterDTO = {
      username: this.registerForm.value.username || '',
      email: this.registerForm.value.email || '',
      password: this.registerForm.value.password || ''
    };

    this.authService.register(data).subscribe({
      next: (response: HttpResponse<string>) => {
        if (response.status === 200) {
          console.log('Registration successful:', response.body);
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = response.body || 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.errorMessage = error.error || 'An error occurred during registration. Please try again.';
      }
    });
  }
}
