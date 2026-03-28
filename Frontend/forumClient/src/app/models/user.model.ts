export interface User {
  id: number;
  username: string;
  description?: string;
  icon: string;
  role: string;
  followerCount?: number;
  followingCount?: number;
}

export interface UserEditDTO {
  id: number;
  username: string;
  description: string;
  icon: string;
}
