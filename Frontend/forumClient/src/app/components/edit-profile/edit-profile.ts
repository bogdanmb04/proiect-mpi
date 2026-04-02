import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user-service';
import { AuthenticationService } from '../../services/authentication-service';
import { UserEditDTO } from '../../models/user.model';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthenticationService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  userId = signal<number>(0);
  username = signal('');
  description = signal('');
  currentIcon = signal<string>('');
  newIconBase64 = signal<string>('');
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Check if user is editing their own profile
    if (!this.authService.user || this.authService.user.id !== id) {
      this.router.navigate(['/']);
      return;
    }

    this.userId.set(id);
    this.loadUserData(id);
  }

  loadUserData(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        if (user) {
          this.username.set(user.username);
          this.description.set(user.description || '');
          this.currentIcon.set(user.icon);
        }
      },
      error: (err) => {
        console.error('Failed to load user data:', err);
        this.errorMessage.set('Failed to load profile data');
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.newIconBase64.set(base64);
    };
    reader.readAsDataURL(file);
  }

  getDisplayIcon(): string {
    return this.newIconBase64() || this.currentIcon();
  }

  saveProfile() {
    if (!this.username().trim()) {
      this.errorMessage.set('Username is required');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const dto: UserEditDTO = {
      id: this.userId(),
      username: this.username(),
      description: this.description(),
      icon: this.getDisplayIcon()
    };

    this.userService.updateUserProfile(dto).subscribe({
      next: (response) => {
        if (response.status === 200) {
          // Update local user data
          if (this.authService.user) {
            this.authService.user.username = dto.username;
            this.authService.user.icon = dto.icon;
            localStorage.setItem('user', JSON.stringify(this.authService.user));
          }
          this.router.navigate(['/profile', this.userId()]);
        }
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.errorMessage.set(err.error?.message || 'Failed to update profile');
        this.isLoading.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/profile', this.userId()]);
  }
}
