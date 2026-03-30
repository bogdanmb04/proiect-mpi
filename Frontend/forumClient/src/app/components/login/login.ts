import { Component, signal, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { LoginDTO } from '../../models/login.model';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  errorMessage = signal<string>('');
  authService = inject(AuthenticationService);
  router = inject(Router);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  loginUser() {
    const data: LoginDTO = {
      username: this.loginForm.value.username || '',
      password: this.loginForm.value.password || ''
    };

    this.authService.login(data).subscribe({
      next: (response) => {
        if (response.status === 200 && response.body) {
          this.authService.setUser(response.body);
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'An error occurred during login.');
      }
    });
  }
}
