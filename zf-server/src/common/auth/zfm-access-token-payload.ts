export class AccessTokenPayload {
  username: string;
  role: string;
  sub: string;
  iat?: number;
  exp?: number
}
