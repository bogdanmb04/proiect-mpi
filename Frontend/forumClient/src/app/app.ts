import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './components/topbar/topbar';
import { AuthenticationService } from './services/authentication-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ForumClient');
  private authService = inject(AuthenticationService);

  constructor() {
    // Try to restore session from refresh token on app startup
    this.authService.restoreSessionFromRefreshToken().catch(() => {
      // Session restore failed, user is not logged in
      console.log('No active session found');
    });
  }
}

