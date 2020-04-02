export class AccessTokenPayload {
  username: string;
  sub: string;
  iat?: number;
  exp?: number;
  passwordChangeRequired: boolean;
}
