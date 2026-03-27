export interface LoginResponseDTO {
  username: string;
  userId: number;
  icon: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}
