import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../services/authentication-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  authService = inject(AuthenticationService);
  router = inject(Router);

  logout() {
    this.authService.logoutFromServer().subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      },
      error: (_err) => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
