/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { RegisterDTO } from '../models/register.model';
import { LoginDTO } from '../models/login.model';
import { LoginResponseDTO } from '../models/login-response.model';
import { User } from '../models/user.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  apiUrl = environment.usersApi;
  user: User | null = null;
  private readonly USER_STORAGE_KEY = 'forum_user';
  private isRefreshing = false;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  register(userData: RegisterDTO) {
    return this.http.post(
      `${this.apiUrl}/register`,
      userData,
      {
        responseType: 'text' as const,
        observe: 'response' as const,
        withCredentials: true
      }
    );
  }

  login(userData: LoginDTO) {
    return this.http.post<LoginResponseDTO>(
      `${this.apiUrl}/login`,
      userData,
      {
        responseType: 'json' as const,
        observe: 'response' as const,
        withCredentials: true
      }
    );
  }

  setUser(response: LoginResponseDTO) {
    const user: User = {
      id: response.userId,
      username: response.username,
      icon: response.icon,
      role: response.role
    };
    this.user = user;
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
  }

  private loadUserFromStorage() {
    const stored = localStorage.getItem(this.USER_STORAGE_KEY);
    if (stored) {
      this.user = JSON.parse(stored);
    }
  }

  async restoreSessionFromRefreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return false;
    }

    try {
      this.isRefreshing = true;
      const response = await firstValueFrom(
        this.http.post<LoginResponseDTO>(
          `${this.apiUrl}/refreshtoken`,
          {},
          {
            withCredentials: true,
            observe: 'response' as const
          }
        )
      );

      if (response.status === 200 && response.body) {
        this.setUser(response.body);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Session restore failed, user needs to login');
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return false;
    }

    try {
      this.isRefreshing = true;
      const response = await firstValueFrom(
        this.http.post<LoginResponseDTO>(
          `${this.apiUrl}/refreshtoken`,
          {},
          {
            withCredentials: true,
            observe: 'response' as const
          }
        )
      );

      if (response.status === 200 && response.body) {
        this.setUser(response.body);
        return true;
      }
      return false;
    } catch (error) {
      this.logout();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  logoutFromServer() {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true,
        observe: 'response' as const
      }
    );
  }

  logout() {
    this.user = null;
    localStorage.removeItem(this.USER_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }
}
