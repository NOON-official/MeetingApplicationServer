export interface PassportUser {
  name: string;
  sub: number;
  iat: number;
  exp: number;
  refreshToken?: string;
}
