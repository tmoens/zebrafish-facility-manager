export class AccessTokenPayload {
  username: string;
  sub: string;
  iat?: number;
  exp?: number;
  role?: string;
  passwordChangeRequired: boolean;
}
