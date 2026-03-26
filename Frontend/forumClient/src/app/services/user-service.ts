import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { User, UserEditDTO } from '../models/user.model';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiUrl = environment.usersApi;

  constructor(private http: HttpClient) { }

  getUserById(id: number): Observable<User | null> {
    return this.http.get<any>(`${this.apiUrl}/profile/${id}`).pipe(
      map(response => {
        if (!response) return null;
        return {
          id,
          username: response.username,
          description: response.description,
          icon: response.icon,
          followerCount: response.followerCount,
          followingCount: response.followingCount
        } as User;
      })
    );
  }

  updateUserProfile(userData: UserEditDTO) {
    return this.http.post(
      `${this.apiUrl}/profile/edit`,
      userData,
      {
        responseType: 'json' as const,
        observe: 'response' as const,
        withCredentials: true
      }
    );
  }

  followUser(id: number) {
    return this.http.post(`${this.apiUrl}/follow/${id}`, {}, {
      observe: 'response' as const,
      withCredentials: true
    });
  }

  unfollowUser(id: number) {
    return this.http.post(`${this.apiUrl}/unfollow/${id}`, {}, {
      observe: 'response' as const,
      withCredentials: true
    });
  }

  isFollowingUser(id: number) {
    return this.http.get<{ isFollowing: boolean }>(`${this.apiUrl}/follow/state/${id}`, {
      withCredentials: true
    });
  }
}
