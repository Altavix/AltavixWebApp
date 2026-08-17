export interface User {
  id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  role?: string;
}

export interface AuthResponseDto {
  userId: string;
  token: string;
  refreshToken: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
}
